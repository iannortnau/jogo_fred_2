import {useCallback, useContext, useEffect, useRef, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import { v1 as uuidv1 } from "uuid";
import Tiro1 from "../entities/Tiro1";
import Player from "../entities/Player";
import Arena from "../ornamental/Arena";
import Inimigo from "../entities/Inimigo";
import PowerUp from "../entities/PowerUp";
import SelecaoPersonagem from "./SelecaoPersonagem";
import ControlesMobile from "./ControlesMobile";
import {GameContext} from "../../contexts/gameContext";
import {PERSONAGEM_PADRAO} from "../../data/personagens";
import {ADUBO_POR_LORENZO, ADUBO_POR_SACO, CHANCE_SACO_ADUBO} from "../../data/fazenda";
import {useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Arena.module.css";
import {useGameAudio} from "../../hooks/useGameAudio";
import {useLoopDeJogo} from "../../hooks/useLoopDeJogo";
import {useEntradaJogo} from "../../hooks/useEntradaJogo";
import {retangulosColidem} from "../../engine/motor";

const LARGURA_PLAYER = 86;
const ALTURA_PLAYER = 58;
const LARGURA_TIRO = 18;
const ALTURA_TIRO = 6;
const LARGURA_SUPER_TIRO = 38;
const ALTURA_SUPER_TIRO = 10;
const LARGURA_INIMIGO = 44;
const ALTURA_INIMIGO = 44;
const LARGURA_POWER_UP = 46;
const ALTURA_POWER_UP = 46;
const VIDA_INICIAL = 100;
const VELOCIDADE_PLAYER = 2;
const VELOCIDADE_TIRO = 5;
const VELOCIDADE_SUPER_TIRO = 9;
const VELOCIDADE_POWER_UP = 1.15;
const DANO_INIMIGO = 20;
const DANO_ESCAPOU = 10;
const COOLDOWN_TIRO = 150;
const COOLDOWN_SUPER = 80;
const INTERVALO_SPAWN_BASE = 1100;
const MAX_INIMIGOS = 8;
const CHANCE_POWER_UP = 0.36;
const DURACAO_TIRO_DUPLO = 9000;
const DURACAO_ESCUDO = 7000;
const DURACAO_SUPER = 10000;
const TIPOS_POWER_UP = ["vida", "tiroDuplo", "escudo", "super"];

function atributosDe(personagem){
    return (personagem || PERSONAGEM_PADRAO).atributos;
}

function criaInimigo(larguraArena, alturaArena, pontos = 0, visivel = false){
    const bonusVelocidade = Math.min(pontos / 250, 2);

    return {
        id: uuidv1(),
        x: visivel ? larguraArena - LARGURA_INIMIGO - 80 : larguraArena + 24,
        y: Math.floor(Math.random() * (alturaArena - ALTURA_INIMIGO)),
        velocidade: 1 + Math.random() * 0.8 + bonusVelocidade,
    };
}

function criaPowerUp(x, y, tipoForcado){
    const tipo = tipoForcado || TIPOS_POWER_UP[Math.floor(Math.random() * TIPOS_POWER_UP.length)];

    return {
        id: uuidv1(),
        tipo,
        x,
        y,
        velocidade: VELOCIDADE_POWER_UP,
    };
}

function criaEstadoInicial(larguraArena, alturaArena, personagem){
    const vidaMaxima = atributosDe(personagem).vida || VIDA_INICIAL;

    return {
        player: {
            x: 40,
            y: Math.floor((alturaArena - ALTURA_PLAYER) / 2),
        },
        tiros: [],
        inimigos: [criaInimigo(larguraArena, alturaArena, 0, true)],
        powerUps: [],
        efeitos: {
            tiroDuplo: 0,
            escudo: 0,
            super: 0,
        },
        vida: vidaMaxima,
        vidaMaxima,
        pontos: 0,
        lorenzos: 0,
        adubo: 0,
        spawnTimer: 0,
        gameOver: false,
    };
}

export default function MainGame() {
    const {intervaloDeAtualizacao, larguraArena, alturaArena, limitaX, limitaY} = useContext(GameContext);
    const [personagem, setPersonagem] = useState(null);
    const [jogo, setJogo] = useState(function () {
        return criaEstadoInicial(larguraArena, alturaArena, null);
    });
    const {audioAtivo, alternarAudio, registrarInteracao, tocarPowerUp, tocarTiro} = useGameAudio();
    const {registrarRun} = useFazenda();
    const [balanco, setBalanco] = useState(null);
    const runCreditadaRef = useRef(false);
    const ultimoTiroRef = useRef(0);
    const acoesRef = useRef({});
    const cadenciaAtual = atributosDe(personagem).cadencia;

    const {teclasRef, direcao, pressionarControle, soltarControle, limpaTeclas} = useEntradaJogo({
        ativo: Boolean(personagem),
        repetirAcao: (COOLDOWN_TIRO * cadenciaAtual) + 30,
        aoInteragir: registrarInteracao,
        aoAcao: function () {
            if(acoesRef.current.atira){
                acoesRef.current.atira();
            }
        },
        aoTecla: function (tecla) {
            if(tecla === "r" && acoesRef.current.reiniciar){
                acoesRef.current.reiniciar();
            }

            if(tecla === "t" && acoesRef.current.trocarPersonagem){
                acoesRef.current.trocarPersonagem();
            }
        },
    });

    const reiniciar = useCallback(function () {
        limpaTeclas();
        ultimoTiroRef.current = 0;
        runCreditadaRef.current = false;
        setBalanco(null);
        setJogo(criaEstadoInicial(larguraArena, alturaArena, personagem));
    }, [alturaArena, larguraArena, limpaTeclas, personagem]);

    const escolherPersonagem = useCallback(function (novoPersonagem) {
        limpaTeclas();
        ultimoTiroRef.current = 0;
        registrarInteracao();
        runCreditadaRef.current = false;
        setBalanco(null);
        setPersonagem(novoPersonagem);
        setJogo(criaEstadoInicial(larguraArena, alturaArena, novoPersonagem));
    }, [alturaArena, larguraArena, limpaTeclas, registrarInteracao]);

    const trocarPersonagem = useCallback(function () {
        limpaTeclas();
        ultimoTiroRef.current = 0;
        runCreditadaRef.current = false;
        setBalanco(null);
        setPersonagem(null);
    }, [limpaTeclas]);

    const atira = useCallback(function () {
        const agora = Date.now();
        const efeitosAtivos = jogo.efeitos || {tiroDuplo: 0, escudo: 0, super: 0};
        const cooldownAtual = (efeitosAtivos.super > 0 ? COOLDOWN_SUPER : COOLDOWN_TIRO) * cadenciaAtual;

        if(!personagem || jogo.gameOver){
            return;
        }

        if(agora - ultimoTiroRef.current < cooldownAtual){
            return;
        }

        ultimoTiroRef.current = agora;
        tocarTiro();
        setJogo(function (estadoAtual) {
            if(estadoAtual.gameOver){
                return estadoAtual;
            }

            const efeitosAtuais = estadoAtual.efeitos || {tiroDuplo: 0, escudo: 0, super: 0};
            const superAtivo = efeitosAtuais.super > 0;
            const deslocamentosTiro = superAtivo ? [-16, 0, 16] : efeitosAtuais.tiroDuplo > 0 ? [-10, 10] : [0];
            const novosTiros = deslocamentosTiro.map(function (deslocamentoY) {
                return {
                    id: uuidv1(),
                    x: estadoAtual.player.x + LARGURA_PLAYER,
                    y: estadoAtual.player.y + (ALTURA_PLAYER / 2) - ((superAtivo ? ALTURA_SUPER_TIRO : ALTURA_TIRO) / 2) + deslocamentoY,
                    super: superAtivo,
                };
            });

            return {
                ...estadoAtual,
                tiros: [...estadoAtual.tiros, ...novosTiros],
            };
        });
    }, [cadenciaAtual, jogo.efeitos, jogo.gameOver, personagem, tocarTiro]);

    acoesRef.current = {atira, reiniciar, trocarPersonagem};

    const avancaPartida = useCallback(function (passo) {
        const atributos = atributosDe(personagem);

        setJogo(function (estadoAtual) {
            if(estadoAtual.gameOver){
                return estadoAtual;
            }

            const movimento = direcao();

            const efeitosAtuais = estadoAtual.efeitos || {tiroDuplo: 0, escudo: 0, super: 0};
            let efeitos = {
                tiroDuplo: Math.max(0, efeitosAtuais.tiroDuplo - passo),
                escudo: Math.max(0, efeitosAtuais.escudo - passo),
                super: Math.max(0, efeitosAtuais.super - passo),
            };
            const velocidadeBase = VELOCIDADE_PLAYER * atributos.velocidade;
            const velocidadePlayer = efeitos.super > 0 ? velocidadeBase * 1.9 : velocidadeBase;

            const player = {
                x: limitaX(estadoAtual.player.x + (movimento.x * velocidadePlayer), LARGURA_PLAYER),
                y: limitaY(estadoAtual.player.y + (movimento.y * velocidadePlayer), ALTURA_PLAYER),
            };

            let tiros = estadoAtual.tiros
                .map(function (tiro) {
                    return {
                        ...tiro,
                        x: tiro.x + (tiro.super ? VELOCIDADE_SUPER_TIRO : VELOCIDADE_TIRO),
                    };
                })
                .filter(function (tiro) {
                    return tiro.x <= larguraArena;
                });

            let inimigos = estadoAtual.inimigos.map(function (inimigo) {
                return {
                    ...inimigo,
                    x: inimigo.x - inimigo.velocidade,
                    };
                });

            let powerUps = (estadoAtual.powerUps || [])
                .map(function (powerUp) {
                    return {
                        ...powerUp,
                        x: powerUp.x - powerUp.velocidade,
                    };
                })
                .filter(function (powerUp) {
                    return powerUp.x > -LARGURA_POWER_UP;
                });

            const tirosRemovidos = new Set();
            const inimigosRemovidos = new Set();
            const novosPowerUps = [];
            const chancePowerUp = Math.min(0.9, CHANCE_POWER_UP * atributos.sortePowerUp);
            let pontosGanhos = 0;
            let lorenzosAbatidos = 0;
            let aduboGanho = 0;

            tiros.forEach(function (tiro) {
                inimigos.forEach(function (inimigo) {
                    if(tirosRemovidos.has(tiro.id) || inimigosRemovidos.has(inimigo.id)){
                        return;
                    }

                    const colidiu = retangulosColidem(
                        {
                            ...tiro,
                            largura: tiro.super ? LARGURA_SUPER_TIRO : LARGURA_TIRO,
                            altura: tiro.super ? ALTURA_SUPER_TIRO : ALTURA_TIRO,
                        },
                        {...inimigo, largura: LARGURA_INIMIGO, altura: ALTURA_INIMIGO}
                    );

                    if(colidiu){
                        if(!tiro.super){
                            tirosRemovidos.add(tiro.id);
                        }

                        inimigosRemovidos.add(inimigo.id);
                        pontosGanhos += Math.round((tiro.super ? 15 : 10) * atributos.pontos);
                        lorenzosAbatidos++;
                        aduboGanho += ADUBO_POR_LORENZO;

                        if(Math.random() < chancePowerUp){
                            novosPowerUps.push(criaPowerUp(inimigo.x, inimigo.y));
                        }

                        if(Math.random() < CHANCE_SACO_ADUBO){
                            novosPowerUps.push(criaPowerUp(inimigo.x, inimigo.y, "adubo"));
                        }
                    }
                });
            });

            tiros = tiros.filter(function (tiro) {
                return !tirosRemovidos.has(tiro.id);
            });

            inimigos = inimigos.filter(function (inimigo) {
                return !inimigosRemovidos.has(inimigo.id);
            });

            const playerBox = {...player, largura: LARGURA_PLAYER, altura: ALTURA_PLAYER};
            const inimigosQueDerrubaramVida = new Set();
            let danoRecebido = 0;

            inimigos.forEach(function (inimigo) {
                const inimigoBox = {...inimigo, largura: LARGURA_INIMIGO, altura: ALTURA_INIMIGO};

                if(retangulosColidem(playerBox, inimigoBox)){
                    inimigosQueDerrubaramVida.add(inimigo.id);

                    if(efeitos.escudo <= 0 && efeitos.super <= 0){
                        danoRecebido += DANO_INIMIGO;
                    }

                    return;
                }

                if(inimigo.x <= 0){
                    inimigosQueDerrubaramVida.add(inimigo.id);
                    danoRecebido += DANO_ESCAPOU;
                }
            });

            inimigos = inimigos.filter(function (inimigo) {
                return !inimigosQueDerrubaramVida.has(inimigo.id);
            });

            powerUps = [...powerUps, ...novosPowerUps];

            const vidaMaxima = estadoAtual.vidaMaxima || VIDA_INICIAL;
            let pontos = estadoAtual.pontos + pontosGanhos;
            let vida = Math.max(0, estadoAtual.vida - danoRecebido);
            let coletouPowerUp = false;

            powerUps = powerUps.filter(function (powerUp) {
                const coletou = retangulosColidem(
                    playerBox,
                    {...powerUp, largura: LARGURA_POWER_UP, altura: ALTURA_POWER_UP}
                );

                if(!coletou){
                    return true;
                }

                coletouPowerUp = true;
                pontos += Math.round(5 * atributos.pontos);

                if(powerUp.tipo === "adubo"){
                    aduboGanho += ADUBO_POR_SACO;
                }

                if(powerUp.tipo === "vida"){
                    vida = Math.min(vidaMaxima, vida + 25);
                }

                if(powerUp.tipo === "tiroDuplo"){
                    efeitos = {
                        ...efeitos,
                        tiroDuplo: DURACAO_TIRO_DUPLO * atributos.duracaoPowerUp,
                    };
                }

                if(powerUp.tipo === "escudo"){
                    efeitos = {
                        ...efeitos,
                        escudo: DURACAO_ESCUDO * atributos.duracaoPowerUp,
                    };
                }

                if(powerUp.tipo === "super"){
                    efeitos = {
                        ...efeitos,
                        super: DURACAO_SUPER * atributos.duracaoPowerUp,
                    };
                }

                return false;
            });

            if(coletouPowerUp){
                tocarPowerUp();
            }

            let spawnTimer = estadoAtual.spawnTimer + passo;
            const intervaloSpawn = Math.max(450, INTERVALO_SPAWN_BASE - (pontos * 3));
            const limiteInimigos = Math.min(MAX_INIMIGOS, 3 + Math.floor(pontos / 50));

            if(spawnTimer >= intervaloSpawn && inimigos.length < limiteInimigos){
                inimigos = [...inimigos, criaInimigo(larguraArena, alturaArena, pontos)];
                spawnTimer = 0;
            }

            return {
                ...estadoAtual,
                player,
                tiros,
                inimigos,
                powerUps,
                efeitos,
                vida,
                vidaMaxima,
                pontos,
                lorenzos: estadoAtual.lorenzos + lorenzosAbatidos,
                adubo: estadoAtual.adubo + aduboGanho,
                spawnTimer,
                gameOver: vida <= 0,
            };
        });
    }, [alturaArena, direcao, larguraArena, limitaX, limitaY, personagem, tocarPowerUp]);

    useLoopDeJogo(Boolean(personagem) && !jogo.gameOver, intervaloDeAtualizacao, avancaPartida);

    useEffect(function () {
        if(!personagem || !jogo.gameOver || runCreditadaRef.current){
            return;
        }

        runCreditadaRef.current = true;
        setBalanco(registrarRun({
            pilotoId: personagem.id,
            lorenzos: jogo.lorenzos,
            adubo: jogo.adubo,
            pontos: jogo.pontos,
        }));
    }, [jogo.adubo, jogo.gameOver, jogo.lorenzos, jogo.pontos, personagem, registrarRun]);

    if(!personagem){
        return (
            <SelecaoPersonagem onEscolher={escolherPersonagem} />
        )
    }

    const efeitosAtivos = jogo.efeitos || {tiroDuplo: 0, escudo: 0, super: 0};
    const powerUps = jogo.powerUps || [];
    const vidaMaxima = jogo.vidaMaxima || VIDA_INICIAL;

    return (
        <div className={styles.gameLayout}>
            <Arena>
                <div className={styles.hud}>
                    <div className={styles.vidaGrupo}>
                        <span className={styles.hudPiloto}>
                            <span className={styles.hudPilotoFoto} style={personagem.estiloNave}>
                                <Image
                                    src={personagem.foto}
                                    alt={personagem.nome}
                                    layout="fill"
                                    objectFit="cover"
                                    objectPosition="center center"
                                />
                            </span>
                            {personagem.nome}
                        </span>
                        <span className={styles.hudLabel}>Vida</span>
                        <div className={styles.vidaBarra}>
                            <span style={{width: ((jogo.vida / vidaMaxima) * 100) + "%"}} />
                        </div>
                        <span className={styles.vidaTexto}>{jogo.vida}</span>
                    </div>
                    <div className={styles.hudDireita}>
                        <div className={styles.powerStatus}>
                            {efeitosAtivos.tiroDuplo > 0 && <span>x2</span>}
                            {efeitosAtivos.escudo > 0 && <span>Escudo</span>}
                            {efeitosAtivos.super > 0 && <span>SUPER</span>}
                        </div>
                        <button
                            className={styles.audioButton}
                            type="button"
                            onClick={alternarAudio}
                        >
                            {audioAtivo ? "Som ligado" : "Som mudo"}
                        </button>
                        <strong className={styles.pontos}>Pontos: {jogo.pontos}</strong>
                        <strong className={styles.aduboHud}>Adubo: {jogo.adubo}</strong>
                    </div>
                </div>

                <Player
                    x={jogo.player.x}
                    y={jogo.player.y}
                    largura={LARGURA_PLAYER}
                    altura={ALTURA_PLAYER}
                    personagem={personagem}
                    escudoAtivo={efeitosAtivos.escudo > 0}
                    superAtivo={efeitosAtivos.super > 0}
                />

                {jogo.tiros.map(function (tiro) {
                    return (
                        <Tiro1
                            key={tiro.id}
                            x={tiro.x}
                            y={tiro.y}
                            super={tiro.super}
                        />
                    );
                })}

                {jogo.inimigos.map(function (inimigo) {
                    return (
                        <Inimigo
                            key={inimigo.id}
                            x={inimigo.x}
                            y={inimigo.y}
                        />
                    );
                })}

                {powerUps.map(function (powerUp) {
                    return (
                        <PowerUp
                            key={powerUp.id}
                            tipo={powerUp.tipo}
                            x={powerUp.x}
                            y={powerUp.y}
                        />
                    );
                })}

                {jogo.gameOver && (
                    <div className={styles.gameOver}>
                        <strong>Fim de jogo</strong>
                        <span>{personagem.nome} fez {jogo.pontos} pontos</span>

                        <div className={styles.balanco}>
                            <span><em>Lorenzos abatidos</em><strong>{jogo.lorenzos}</strong></span>
                            <span><em>Adubo bruto</em><strong>+{balanco ? balanco.adubo : jogo.adubo}</strong></span>
                            <span><em>XP de operacao</em><strong>+{balanco ? balanco.xp : 0}</strong></span>
                        </div>

                        {balanco && balanco.aduboCreditado < balanco.adubo && (
                            <span className={styles.balancoAviso}>
                                Tanque cheio: so entraram {balanco.aduboCreditado} de adubo.
                            </span>
                        )}

                        <div className={styles.gameOverBotoes}>
                            <button type="button" onClick={reiniciar}>Reiniciar</button>
                            <button type="button" onClick={trocarPersonagem}>Trocar piloto</button>
                            <Link href="/fazenda">
                                <a className={styles.botaoFazenda}>Ir para a Fazenda</a>
                            </Link>
                            <Link href="/defesa">
                                <a className={styles.botaoFazenda}>Ganja vs Lorenzo</a>
                            </Link>
                        </div>
                    </div>
                )}
            </Arena>

            <div className={styles.desktopCommands}>
                <span><kbd>WASD</kbd> mover</span>
                <span><kbd>Espaco</kbd> tiro</span>
                <span><kbd>R</kbd> reiniciar</span>
                <span><kbd>T</kbd> trocar piloto</span>
            </div>

            <ControlesMobile
                aoPressionar={pressionarControle}
                aoSoltar={soltarControle}
            />
        </div>
    )
}
