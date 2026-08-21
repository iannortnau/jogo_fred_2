import {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {v1 as uuidv1} from "uuid";
import Arena from "../ornamental/Arena";
import ControlesMobile from "../structural/ControlesMobile";
import {GameContext} from "../../contexts/gameContext";
import {useFazenda} from "../../contexts/fazendaContext";
import {useGameAudio} from "../../hooks/useGameAudio";
import {useLoopDeJogo} from "../../hooks/useLoopDeJogo";
import {useEntradaJogo} from "../../hooks/useEntradaJogo";
import {retangulosColidem, limita} from "../../engine/motor";
import {
    DANO_INVASAO,
    GRADE,
    MAMADEIRA,
    MUDAS,
    RESINA_POR_GOTA,
    SUPER_PLANTAS,
    TAMANHOS,
    VALIDADE_RESINA,
    VELOCIDADE_VASO,
    VIDA_CERCA,
    buscaLorenzo,
    buscaPlanta,
    comandoDoPiloto,
    recompensaDaFase,
} from "../../data/defesa";
import styles from "../../styles/components/Defesa.module.css";

function posicaoCelula(linha, coluna){
    return {
        x: GRADE.inicioX + (coluna * GRADE.largura),
        y: GRADE.inicioY + (linha * GRADE.altura),
    };
}

function centroPlanta(linha, coluna){
    const base = posicaoCelula(linha, coluna);

    return {
        x: base.x + ((GRADE.largura - TAMANHOS.planta.largura) / 2),
        y: base.y + ((GRADE.altura - TAMANHOS.planta.altura) / 2),
    };
}

function alturaDaLinha(linha, altura){
    return GRADE.inicioY + (linha * GRADE.altura) + ((GRADE.altura - altura) / 2);
}

function caixaDe(entidade, tamanho){
    return {x: entidade.x, y: entidade.y, largura: tamanho.largura, altura: tamanho.altura};
}

function criaBatalha(fase, alturaArena){
    const pendentes = [];
    let relogio = 0;

    fase.ondas.forEach(function (onda, indiceOnda) {
        relogio += onda.atraso;
        let ordem = 0;

        onda.itens.forEach(function (item) {
            for(let unidade = 0; unidade < item.quantidade; unidade++){
                pendentes.push({
                    id: uuidv1(),
                    tipo: item.tipo,
                    linha: typeof item.linha === "number" ? item.linha : Math.floor(Math.random() * GRADE.linhas),
                    em: relogio + (ordem * 700),
                    onda: indiceOnda,
                });
                ordem++;
            }
        });
    });

    return {
        vaso: {
            x: GRADE.inicioX + 10,
            y: (alturaArena - TAMANHOS.vaso.altura) / 2,
        },
        plantas: [],
        lorenzos: [],
        projeteis: [],
        resinas: [],
        mamadeiras: [],
        bloqueios: [],
        imunidades: [],
        protecaoAte: 0,
        recargas: {},
        pendentes,
        resina: fase.resinaInicial,
        vidaCerca: VIDA_CERCA,
        tempo: 0,
        ondasTotais: fase.ondas.length,
        derrotados: 0,
        invasoes: 0,
        estado: "jogando",
    };
}

export default function CampoDefesa(props) {
    const fase = props.fase;
    const comandante = props.comandante;
    const {intervaloDeAtualizacao, larguraArena, alturaArena, limitaX, limitaY} = useContext(GameContext);
    const {fazenda, usaSuperPlanta, registrarDefesa} = useFazenda();
    const {audioAtivo, alternarAudio, registrarInteracao, tocarTiro, tocarPowerUp} = useGameAudio();
    const comando = useMemo(function () {
        return comandoDoPiloto(comandante);
    }, [comandante]);
    const [batalha, setBatalha] = useState(function () {
        return criaBatalha(fase, alturaArena);
    });
    const [cartaSelecionada, setCartaSelecionada] = useState("muda:broto");
    const cartas = useMemo(function () {
        const comuns = MUDAS.map(function (planta) {
            return {
                chave: "muda:" + planta.id,
                plantaId: planta.id,
                origem: "muda",
                nome: planta.nome,
                icone: planta.icone,
                custoResina: planta.custoResina,
                consomeCarta: false,
                multiplicador: 1,
            };
        });
        const deck = SUPER_PLANTAS.map(function (planta) {
            return {
                chave: "deck:" + planta.id,
                plantaId: planta.id,
                origem: "deck",
                nome: planta.nome,
                icone: planta.icone,
                custoResina: planta.custoResina,
                consomeCarta: true,
                multiplicador: 1,
            };
        });
        return [...comuns, ...deck];
    }, []);
    const cartasRef = useRef(cartas);

    cartasRef.current = cartas;
    const [balanco, setBalanco] = useState(null);
    const acoesRef = useRef({});
    const fechadaRef = useRef(false);
    const estoqueRef = useRef(fazenda.superPlantas);

    estoqueRef.current = fazenda.superPlantas;

    const {direcao, pressionarControle, soltarControle, limpaTeclas} = useEntradaJogo({
        ativo: batalha.estado === "jogando",
        repetirAcao: 0,
        aoInteragir: registrarInteracao,
        aoAcao: function () {
            if(acoesRef.current.plantar){
                acoesRef.current.plantar();
            }
        },
        aoTecla: function (tecla) {
            const indice = parseInt(tecla, 10);

            if(!Number.isNaN(indice) && indice >= 1 && indice <= cartasRef.current.length){
                setCartaSelecionada(cartasRef.current[indice - 1].chave);
            }
        },
    });

    const reiniciar = useCallback(function () {
        limpaTeclas();
        fechadaRef.current = false;
        setBalanco(null);
        setBatalha(criaBatalha(fase, alturaArena));
    }, [alturaArena, fase, limpaTeclas]);

    const plantar = useCallback(function () {
        setBatalha(function (atual) {
            if(atual.estado !== "jogando"){
                return atual;
            }

            const carta = cartasRef.current.find(function (item) {
                return item.chave === cartaSelecionada;
            });
            const planta = carta ? buscaPlanta(carta.plantaId) : null;

            if(!carta || !planta){
                return atual;
            }

            const centroX = atual.vaso.x + (TAMANHOS.vaso.largura / 2);
            const centroY = atual.vaso.y + (TAMANHOS.vaso.altura / 2);
            const coluna = Math.floor((centroX - GRADE.inicioX) / GRADE.largura);
            const linha = Math.floor((centroY - GRADE.inicioY) / GRADE.altura);

            if(coluna < 0 || coluna >= GRADE.colunas || linha < 0 || linha >= GRADE.linhas){
                return atual;
            }

            if((atual.recargas[carta.chave] || 0) > 0){
                return atual;
            }

            if(atual.resina < carta.custoResina){
                return atual;
            }

            if(carta.consomeCarta && (estoqueRef.current[planta.id] || 0) <= 0){
                return atual;
            }

            const bloqueada = atual.bloqueios.some(function (bloqueio) {
                return bloqueio.coluna === coluna && bloqueio.ate > atual.tempo;
            });

            if(bloqueada){
                return atual;
            }

            const ocupada = atual.plantas.some(function (item) {
                return item.linha === linha && item.coluna === coluna;
            });

            if(ocupada && planta.comportamento !== "bomba"){
                return atual;
            }

            if(carta.consomeCarta){
                usaSuperPlanta(planta.id);
            }

            const multiplicador = carta.multiplicador || 1;
            const recargas = {
                ...atual.recargas,
                [carta.chave]: planta.recarga * (comando.recarga || 1),
            };
            const resina = atual.resina - carta.custoResina;

            if(planta.comportamento === "bomba"){
                const alvo = posicaoCelula(linha, coluna);
                const area = {
                    x: alvo.x - GRADE.largura,
                    y: alvo.y - GRADE.altura,
                    largura: GRADE.largura * 3,
                    altura: GRADE.altura * 3,
                };
                const atingidos = [];

                const lorenzos = atual.lorenzos.map(function (lorenzo) {
                    if(!retangulosColidem(area, caixaDe(lorenzo, TAMANHOS.lorenzo))){
                        return lorenzo;
                    }

                    atingidos.push(lorenzo.id);
                    return {...lorenzo, vida: lorenzo.vida - (planta.dano * multiplicador)};
                });

                return {
                    ...atual,
                    resina,
                    recargas,
                    lorenzos: lorenzos.filter(function (lorenzo) {
                        return lorenzo.vida > 0;
                    }),
                    derrotados: atual.derrotados + atingidos.filter(function (id) {
                        return !lorenzos.find(function (lorenzo) {
                            return lorenzo.id === id && lorenzo.vida > 0;
                        });
                    }).length,
                    explosao: {x: alvo.x, y: alvo.y, em: atual.tempo},
                };
            }

            if(planta.comportamento === "alvara"){
                return {
                    ...atual,
                    resina,
                    recargas,
                    bloqueios: [],
                    protecaoAte: atual.tempo + (planta.protecao * (comando.efeitos || 1)),
                };
            }

            const posicao = centroPlanta(linha, coluna);
            const nova = {
                id: uuidv1(),
                plantaId: planta.id,
                linha,
                coluna,
                x: posicao.x,
                y: posicao.y,
                vida: (planta.vida || 200) * (comando.vida || 1) * multiplicador,
                vidaMaxima: (planta.vida || 200) * (comando.vida || 1) * multiplicador,
                multiplicador,
                contador: 0,
            };

            if(planta.comportamento === "checagem"){
                const duracao = planta.imunidade * (comando.efeitos || 1);

                return {
                    ...atual,
                    resina,
                    recargas,
                    plantas: [...atual.plantas, nova],
                    mamadeiras: [],
                    imunidades: [...atual.imunidades, {linha, ate: atual.tempo + duracao}],
                };
            }

            return {
                ...atual,
                resina,
                recargas,
                plantas: [...atual.plantas, nova],
            };
        });
    }, [cartaSelecionada, comando, usaSuperPlanta]);

    acoesRef.current = {plantar};

    const avancaBatalha = useCallback(function (passo) {
        setBatalha(function (atual) {
            if(atual.estado !== "jogando"){
                return atual;
            }

            const tempo = atual.tempo + passo;
            const movimento = direcao();
            const vaso = {
                x: limitaX(atual.vaso.x + (movimento.x * VELOCIDADE_VASO * passo), TAMANHOS.vaso.largura),
                y: limitaY(atual.vaso.y + (movimento.y * VELOCIDADE_VASO * passo), TAMANHOS.vaso.altura),
            };

            const recargas = {};

            Object.keys(atual.recargas).forEach(function (chave) {
                recargas[chave] = Math.max(0, atual.recargas[chave] - passo);
            });

            const protegido = atual.protecaoAte > tempo;
            const bloqueios = atual.bloqueios.filter(function (bloqueio) {
                return !protegido && bloqueio.ate > tempo;
            });
            const imunidades = atual.imunidades.filter(function (imunidade) {
                return imunidade.ate > tempo;
            });

            function linhaImune(linha){
                return imunidades.some(function (imunidade) {
                    return imunidade.linha === linha;
                });
            }

            // --- entram os Lorenzos da vez
            let lorenzos = atual.lorenzos.slice();
            const pendentes = [];

            atual.pendentes.forEach(function (pendente) {
                if(pendente.em > tempo){
                    pendentes.push(pendente);
                    return;
                }

                const tipo = buscaLorenzo(pendente.tipo);

                lorenzos.push({
                    id: pendente.id,
                    tipoId: tipo.id,
                    linha: pendente.linha,
                    x: larguraArena + 20,
                    y: alturaDaLinha(pendente.linha, TAMANHOS.lorenzo.altura),
                    vida: tipo.vida,
                    vidaMaxima: tipo.vida,
                    lentoAte: 0,
                    denunciou: false,
                    contadorPl: 0,
                    mamadeira: Boolean(tipo.carregaMamadeira),
                });
            });

            let plantas = atual.plantas.slice();
            let projeteis = atual.projeteis.slice();
            let resinas = atual.resinas.slice();
            let mamadeiras = atual.mamadeiras.slice();
            let resina = atual.resina;
            let vidaCerca = atual.vidaCerca;
            let derrotados = atual.derrotados;
            let invasoes = atual.invasoes;
            const novosBloqueios = [];

            // --- plantas agem
            plantas = plantas.map(function (planta) {
                const dados = buscaPlanta(planta.plantaId);

                if(!dados){
                    return planta;
                }

                if(dados.comportamento === "gerador"){
                    const contador = planta.contador + passo;

                    if(contador < dados.intervalo){
                        return {...planta, contador};
                    }

                    resinas.push({
                        id: uuidv1(),
                        x: planta.x + 4 + (Math.random() * 20),
                        y: planta.y + 10,
                        valor: Math.round(RESINA_POR_GOTA * (comando.resina || 1)),
                        nasceuEm: tempo,
                    });

                    return {...planta, contador: 0};
                }

                if(dados.comportamento === "parede" || dados.comportamento === "checagem"){
                    return planta;
                }

                const linhasAlvo = dados.comportamento === "triplo"
                    ? [planta.linha - 1, planta.linha, planta.linha + 1]
                    : [planta.linha];
                const temAlvo = lorenzos.some(function (lorenzo) {
                    return linhasAlvo.includes(lorenzo.linha) && lorenzo.x > planta.x;
                });

                if(!temAlvo){
                    return planta;
                }

                const contador = planta.contador + passo;
                const cadencia = dados.cadencia * (comando.cadencia || 1);

                if(contador < cadencia){
                    return {...planta, contador};
                }

                if(dados.comportamento === "cone"){
                    const alcance = dados.alcanceColunas * GRADE.largura;

                    lorenzos = lorenzos.map(function (lorenzo) {
                        if(lorenzo.linha !== planta.linha){
                            return lorenzo;
                        }

                        if(lorenzo.x < planta.x || lorenzo.x > planta.x + alcance){
                            return lorenzo;
                        }

                        return {...lorenzo, vida: lorenzo.vida - (dados.dano * (planta.multiplicador || 1))};
                    });

                    return {...planta, contador: 0};
                }

                linhasAlvo.forEach(function (linha) {
                    if(linha < 0 || linha >= GRADE.linhas){
                        return;
                    }

                    projeteis.push({
                        id: uuidv1(),
                        linha,
                        x: planta.x + TAMANHOS.planta.largura - 10,
                        y: alturaDaLinha(linha, TAMANHOS.projetil.altura),
                        dano: dados.dano * (planta.multiplicador || 1),
                        velocidade: dados.velocidadeProjetil,
                        lentidao: dados.lentidao || null,
                    });
                });

                return {...planta, contador: 0};
            });

            // --- projeteis andam e batem
            const projeteisRestantes = [];

            projeteis.forEach(function (projetil) {
                const x = projetil.x + (projetil.velocidade * passo);

                if(x > larguraArena){
                    return;
                }

                const caixaProjetil = {
                    x,
                    y: projetil.y,
                    largura: TAMANHOS.projetil.largura,
                    altura: TAMANHOS.projetil.altura,
                };
                let acertou = false;

                mamadeiras = mamadeiras.map(function (mamadeira) {
                    if(acertou || mamadeira.linha !== projetil.linha){
                        return mamadeira;
                    }

                    if(!retangulosColidem(caixaProjetil, caixaDe(mamadeira, TAMANHOS.mamadeira))){
                        return mamadeira;
                    }

                    acertou = true;
                    return {...mamadeira, vida: mamadeira.vida - projetil.dano};
                });

                if(!acertou){
                    lorenzos = lorenzos.map(function (lorenzo) {
                        if(acertou || lorenzo.linha !== projetil.linha){
                            return lorenzo;
                        }

                        if(!retangulosColidem(caixaProjetil, caixaDe(lorenzo, TAMANHOS.lorenzo))){
                            return lorenzo;
                        }

                        acertou = true;

                        return {
                            ...lorenzo,
                            vida: lorenzo.vida - projetil.dano,
                            lentoAte: projetil.lentidao
                                ? tempo + (projetil.lentidao.duracao * (comando.efeitos || 1))
                                : lorenzo.lentoAte,
                        };
                    });
                }

                if(!acertou){
                    projeteisRestantes.push({...projetil, x});
                }
            });

            projeteis = projeteisRestantes;
            mamadeiras = mamadeiras.filter(function (mamadeira) {
                return mamadeira.vida > 0;
            });

            // --- Lorenzos andam, mordem e aprontam
            const plantasRemovidas = new Set();
            const reforcos = [];

            lorenzos = lorenzos.map(function (lorenzo) {
                const tipo = buscaLorenzo(lorenzo.tipoId);
                const plantaNaFrente = plantas.find(function (planta) {
                    return planta.linha === lorenzo.linha
                        && !plantasRemovidas.has(planta.id)
                        && retangulosColidem(caixaDe(lorenzo, TAMANHOS.lorenzo), caixaDe(planta, TAMANHOS.planta));
                });

                if(plantaNaFrente){
                    if(tipo.apreende && !protegido){
                        plantasRemovidas.add(plantaNaFrente.id);
                        return lorenzo;
                    }

                    plantas = plantas.map(function (planta) {
                        if(planta.id !== plantaNaFrente.id){
                            return planta;
                        }

                        return {...planta, vida: planta.vida - (tipo.dano * (passo / 1000))};
                    });

                    return lorenzo;
                }

                const buffMamadeira = mamadeiras.some(function (mamadeira) {
                    return mamadeira.linha === lorenzo.linha && !linhaImune(lorenzo.linha);
                }) ? 1 + MAMADEIRA.buffVelocidade : 1;
                const buffPastor = lorenzos.some(function (outro) {
                    const dadosOutro = buscaLorenzo(outro.tipoId);

                    return dadosOutro.aura
                        && outro.id !== lorenzo.id
                        && outro.linha === lorenzo.linha
                        && Math.abs(outro.x - lorenzo.x) <= dadosOutro.aura.alcance;
                }) ? 1.3 : 1;
                const lento = lorenzo.lentoAte > tempo ? 0.55 : 1;
                const velocidade = tipo.velocidade * lento * buffMamadeira * buffPastor;
                const x = lorenzo.x - (velocidade * passo);
                let denunciou = lorenzo.denunciou;
                let contadorPl = lorenzo.contadorPl;

                if(tipo.denuncia && !denunciou && x < larguraArena / 2){
                    denunciou = true;
                    reforcos.push({linha: lorenzo.linha});
                }

                if(tipo.pl && !protegido){
                    contadorPl += passo;

                    if(contadorPl >= tipo.pl.intervalo){
                        contadorPl = 0;
                        novosBloqueios.push({
                            coluna: 1 + Math.floor(Math.random() * (GRADE.colunas - 1)),
                            ate: tempo + tipo.pl.duracao,
                        });
                    }
                }

                return {...lorenzo, x, denunciou, contadorPl};
            });

            plantas = plantas.filter(function (planta) {
                return planta.vida > 0 && !plantasRemovidas.has(planta.id);
            });

            reforcos.forEach(function (reforco) {
                lorenzos.push({
                    id: uuidv1(),
                    tipoId: "comum",
                    linha: reforco.linha,
                    x: larguraArena + 20,
                    y: alturaDaLinha(reforco.linha, TAMANHOS.lorenzo.altura),
                    vida: buscaLorenzo("comum").vida,
                    vidaMaxima: buscaLorenzo("comum").vida,
                    lentoAte: 0,
                    denunciou: true,
                    contadorPl: 0,
                    mamadeira: false,
                });
            });

            // --- mortes, invasoes e o que cada um deixa para tras
            const sobreviventes = [];

            lorenzos.forEach(function (lorenzo) {
                const tipo = buscaLorenzo(lorenzo.tipoId);

                if(lorenzo.vida <= 0){
                    derrotados++;

                    if(tipo.multa){
                        resina = Math.max(0, resina - tipo.multa);
                    }

                    if(lorenzo.mamadeira){
                        const coluna = limita(
                            Math.floor((lorenzo.x - GRADE.inicioX) / GRADE.largura),
                            0,
                            GRADE.colunas - 1
                        );
                        const posicao = posicaoCelula(lorenzo.linha, coluna);

                        mamadeiras.push({
                            id: uuidv1(),
                            linha: lorenzo.linha,
                            coluna,
                            x: posicao.x + 24,
                            y: posicao.y + 24,
                            vida: MAMADEIRA.vida,
                        });
                    }

                    return;
                }

                if(lorenzo.x <= GRADE.inicioX - 70){
                    invasoes++;
                    vidaCerca = Math.max(0, vidaCerca - DANO_INVASAO);
                    return;
                }

                sobreviventes.push(lorenzo);
            });

            lorenzos = sobreviventes;

            // --- resina no chao: some com o tempo ou vai para o vaso
            const caixaVaso = {
                x: vaso.x,
                y: vaso.y,
                largura: TAMANHOS.vaso.largura,
                altura: TAMANHOS.vaso.altura,
            };

            resinas = resinas.filter(function (gota) {
                if(tempo - gota.nasceuEm > VALIDADE_RESINA){
                    return false;
                }

                if(retangulosColidem(caixaVaso, caixaDe(gota, TAMANHOS.resina))){
                    resina += gota.valor;
                    return false;
                }

                return true;
            });

            mamadeiras = mamadeiras.filter(function (mamadeira) {
                if(!retangulosColidem(caixaVaso, caixaDe(mamadeira, TAMANHOS.mamadeira))){
                    return true;
                }

                resina += MAMADEIRA.recompensaResina;
                return false;
            });

            const estado = vidaCerca <= 0
                ? "derrota"
                : (pendentes.length === 0 && lorenzos.length === 0 ? "vitoria" : "jogando");

            return {
                ...atual,
                tempo,
                vaso,
                plantas,
                lorenzos,
                projeteis,
                resinas,
                mamadeiras,
                bloqueios: [...bloqueios, ...novosBloqueios],
                imunidades,
                recargas,
                pendentes,
                resina,
                vidaCerca,
                derrotados,
                invasoes,
                estado,
            };
        });
    }, [comando, direcao, larguraArena, limitaX, limitaY]);

    useLoopDeJogo(batalha.estado === "jogando", intervaloDeAtualizacao, avancaBatalha);

    useEffect(function () {
        if(batalha.estado === "jogando" || fechadaRef.current){
            return;
        }

        fechadaRef.current = true;
        limpaTeclas();

        const venceu = batalha.estado === "vitoria";

        registrarDefesa({
            fase,
            venceu,
            repetindo: props.jaVencida,
            comandanteId: comandante.id,
            multiplicadorRecompensa: comando.recompensa || 1,
        });

        if(venceu){
            tocarPowerUp();
        }

        const base = recompensaDaFase(fase, props.jaVencida);
        const multiplicador = comando.recompensa || 1;

        setBalanco({
            venceu,
            recompensa: {
                creditos: Math.round(base.creditos * multiplicador),
                adubo: Math.round(base.adubo * multiplicador),
                xp: Math.round(base.xp * multiplicador),
            },
            derrotados: batalha.derrotados,
        });
    }, [batalha.derrotados, batalha.estado, comandante, comando, fase, limpaTeclas, props.jaVencida, registrarDefesa, tocarPowerUp]);

    const cartaAtual = cartas.find(function (item) {
        return item.chave === cartaSelecionada;
    });
    const ondasFeitas = batalha.ondasTotais - new Set(batalha.pendentes.map(function (pendente) {
        return pendente.onda;
    })).size;

    return (
        <div className={styles.telaDefesa}>
            <Arena>
                <div className={styles.hud}>
                    <span className={styles.hudItem}>🪙 Resina <strong>{Math.floor(batalha.resina)}</strong></span>
                    <span className={styles.hudItem}>
                        🪵 Cerca
                        <span className={styles.barraCerca}>
                            <span style={{width: batalha.vidaCerca + "%"}} />
                        </span>
                    </span>
                    <span className={styles.hudItem}>🌊 Onda <strong>{Math.min(batalha.ondasTotais, ondasFeitas + 1)}/{batalha.ondasTotais}</strong></span>
                    <button className={styles.botaoSom} type="button" onClick={alternarAudio}>
                        {audioAtivo ? "Som ligado" : "Som mudo"}
                    </button>
                </div>

                <div className={styles.cerca} />

                {Array.from({length: GRADE.linhas}, function (item, linha) {
                    return Array.from({length: GRADE.colunas}, function (nada, coluna) {
                        const posicao = posicaoCelula(linha, coluna);
                        const bloqueada = batalha.bloqueios.some(function (bloqueio) {
                            return bloqueio.coluna === coluna && bloqueio.ate > batalha.tempo;
                        });

                        return (
                            <div
                                key={linha + "-" + coluna}
                                className={`${styles.celula} ${(linha + coluna) % 2 === 0 ? styles.celulaPar : ""} ${bloqueada ? styles.celulaBloqueada : ""}`}
                                style={{
                                    left: posicao.x + "px",
                                    top: posicao.y + "px",
                                    width: GRADE.largura + "px",
                                    height: GRADE.altura + "px",
                                }}
                            >
                                {bloqueada && <span className={styles.selo}>PL</span>}
                            </div>
                        );
                    });
                })}

                {batalha.plantas.map(function (planta) {
                    const dados = buscaPlanta(planta.plantaId);

                    return (
                        <div
                            key={planta.id}
                            className={styles.planta}
                            style={{left: planta.x + "px", top: planta.y + "px"}}
                        >
                            <span className={styles.plantaIcone}>{dados.icone}</span>
                            <span className={styles.barraVida}>
                                <span style={{width: ((planta.vida / planta.vidaMaxima) * 100) + "%"}} />
                            </span>
                        </div>
                    );
                })}

                {batalha.mamadeiras.map(function (mamadeira) {
                    return (
                        <div
                            key={mamadeira.id}
                            className={styles.mamadeira}
                            style={{left: mamadeira.x + "px", top: mamadeira.y + "px"}}
                        >
                            🍼
                            <span className={styles.tarja} />
                        </div>
                    );
                })}

                {batalha.resinas.map(function (gota) {
                    return (
                        <div
                            key={gota.id}
                            className={styles.resina}
                            style={{left: gota.x + "px", top: gota.y + "px"}}
                        >
                            🪙
                        </div>
                    );
                })}

                {batalha.projeteis.map(function (projetil) {
                    return (
                        <span
                            key={projetil.id}
                            className={styles.projetil}
                            style={{left: projetil.x + "px", top: projetil.y + "px"}}
                        />
                    );
                })}

                {batalha.lorenzos.map(function (lorenzo) {
                    const tipo = buscaLorenzo(lorenzo.tipoId);

                    return (
                        <div
                            key={lorenzo.id}
                            className={`${styles.lorenzo} ${tipo.chefe ? styles.lorenzoChefe : ""} ${lorenzo.lentoAte > batalha.tempo ? styles.lorenzoLento : ""}`}
                            style={{left: lorenzo.x + "px", top: lorenzo.y + "px"}}
                        >
                            <Image
                                src="/images/inimigo.png"
                                alt={tipo.nome}
                                layout="fill"
                                objectFit="cover"
                                objectPosition="center center"
                            />
                            {tipo.adereco && <span className={styles.adereco}>{tipo.adereco}</span>}
                            {lorenzo.mamadeira && <span className={styles.aderecoProva}>🍼</span>}
                            <span className={styles.barraVida}>
                                <span style={{width: ((lorenzo.vida / lorenzo.vidaMaxima) * 100) + "%"}} />
                            </span>
                        </div>
                    );
                })}

                <div
                    className={styles.vaso}
                    style={{left: batalha.vaso.x + "px", top: batalha.vaso.y + "px"}}
                >
                    <span className={styles.vasoCarta}>{cartaAtual ? cartaAtual.icone : "🌱"}</span>
                </div>

                {balanco && (
                    <div className={styles.fimDeFase}>
                        <strong>{balanco.venceu ? "Plantacao defendida!" : "Invadiram a horta"}</strong>
                        <span>
                            {balanco.derrotados} Lorenzos derrubados na {fase.nome}
                        </span>

                        {balanco.venceu ? (
                            <div className={styles.premios}>
                                <span><em>Creditos</em><strong>+{balanco.recompensa.creditos}</strong></span>
                                <span><em>Adubo</em><strong>+{balanco.recompensa.adubo}</strong></span>
                                <span><em>XP de {comandante.nome}</em><strong>+{balanco.recompensa.xp}</strong></span>
                            </div>
                        ) : (
                            <span className={styles.avisoDerrota}>
                                Um lote da fazenda foi infestado por Erva Daninha.
                            </span>
                        )}

                        <div className={styles.fimBotoes}>
                            <button type="button" onClick={reiniciar}>Jogar de novo</button>
                            <button type="button" onClick={props.aoSair}>Escolher fase</button>
                            <Link href="/fazenda">
                                <a className={styles.botaoFazenda}>Ir para a Fazenda</a>
                            </Link>
                        </div>
                    </div>
                )}
            </Arena>

            <div className={styles.barraCartas}>
                {cartas.map(function (carta, indice) {
                    const planta = buscaPlanta(carta.plantaId);
                    const estoque = fazenda.superPlantas[carta.plantaId] || 0;
                    const semEstoque = carta.consomeCarta && estoque <= 0;
                    const recarga = batalha.recargas[carta.chave] || 0;
                    const semResina = batalha.resina < carta.custoResina;

                    return (
                        <button
                            key={carta.chave}
                            type="button"
                            className={`${styles.carta} ${styles["carta" + carta.origem]} ${cartaSelecionada === carta.chave ? styles.cartaAtiva : ""} ${semEstoque || recarga > 0 || semResina ? styles.cartaIndisponivel : ""}`}
                            onClick={function () {
                                registrarInteracao();
                                setCartaSelecionada(carta.chave);
                            }}
                        >
                            <span className={styles.cartaAtalho}>{indice + 1}</span>
                            <span className={styles.cartaIcone}>{carta.icone}</span>
                            <span className={styles.cartaNome}>{carta.nome}</span>
                            <span className={styles.cartaCusto}>
                                {carta.custoResina > 0 ? carta.custoResina + " 🪙" : "gratis"}
                                {carta.consomeCarta ? " · x" + estoque : ""}
                            </span>
                            {recarga > 0 && (
                                <span
                                    className={styles.cartaRecarga}
                                    style={{height: Math.min(100, (recarga / planta.recarga) * 100) + "%"}}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className={styles.dicaDefesa}>
                <span><kbd>WASD</kbd> mover o vaso</span>
                <span><kbd>Espaco</kbd> plantar</span>
                <span><kbd>1-9</kbd> trocar carta</span>
                <span>Comandante: <strong>{comandante.nome}</strong> · {comando.rotulo}</span>
            </div>

            <ControlesMobile
                aoPressionar={pressionarControle}
                aoSoltar={soltarControle}
                rotuloAcao="PLANTAR"
            />
        </div>
    )
}
