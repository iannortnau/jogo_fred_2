import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {PERSONAGENS, buscaPersonagem} from "../data/personagens";
import {
    CAPACIDADE_POR_NIVEL,
    CAPACIDADE_TANQUE_BASE,
    CHAVE_SAVE,
    CLIQUES_PARA_BANIR,
    CULTURAS,
    CUSTO_FERTILIZANTE_TURBO,
    LOTES_INICIAIS,
    LOTES_POR_EXPANSAO,
    DRENO_ERVA_POR_SEGUNDO,
    DURACAO_FERTILIZANTE_TURBO,
    RISCO_ERVA_BASE,
    TEMPO_REFINO_BASE,
    TICK,
    TOTAL_LOTES,
    UPGRADES,
    VAGAS_TRIPULACAO_BASE,
    custoUpgrade,
    forcaDoBonus,
    nivelDoPiloto,
    xpDaRun,
} from "../data/fazenda";

export const FazendaContext = createContext({});

const MAXIMO_OFFLINE = 8 * 60 * 60 * 1000;

export function buscaCultura(id){
    return CULTURAS.find(function (cultura) {
        return cultura.id === id;
    });
}

function loteVazio(id){
    return {
        id,
        cultura: null,
        progresso: 0,
        pronto: false,
        turboAte: 0,
        praga: null,
    };
}

function estadoInicial(){
    const pilotos = {};

    PERSONAGENS.forEach(function (personagem) {
        pilotos[personagem.id] = {xp: 0, runs: 0};
    });

    const upgrades = {};

    UPGRADES.forEach(function (upgrade) {
        upgrades[upgrade.id] = 0;
    });

    return {
        versao: 1,
        aduboBruto: 0,
        aduboRefinado: 0,
        creditos: 0,
        lotes: Array.from({length: TOTAL_LOTES}, function (item, indice) {
            return loteVazio(indice);
        }),
        refino: {fila: 0, progresso: 0},
        upgrades,
        tripulacao: [],
        pilotos,
        ultimoRun: null,
        totalLorenzos: 0,
        atualizadoEm: Date.now(),
    };
}

// Save antigo pode nao ter campo novo: o merge evita quebrar a fazenda salva.
function normaliza(salvo){
    const base = estadoInicial();

    if(!salvo || typeof salvo !== "object"){
        return base;
    }

    const lotes = Array.isArray(salvo.lotes) ? salvo.lotes : base.lotes;

    return {
        ...base,
        ...salvo,
        lotes: base.lotes.map(function (lote, indice) {
            return {...lote, ...(lotes[indice] || {})};
        }),
        refino: {...base.refino, ...(salvo.refino || {})},
        upgrades: {...base.upgrades, ...(salvo.upgrades || {})},
        pilotos: {...base.pilotos, ...(salvo.pilotos || {})},
        tripulacao: Array.isArray(salvo.tripulacao) ? salvo.tripulacao : [],
    };
}

function carregaSave(){
    if(typeof window === "undefined"){
        return estadoInicial();
    }

    try {
        return normaliza(JSON.parse(window.localStorage.getItem(CHAVE_SAVE)));
    } catch (erro) {
        return estadoInicial();
    }
}


function progressoDoPiloto(estado, id){
    return nivelDoPiloto((estado.pilotos[id] || {}).xp || 0);
}

// Bonus da tripulacao + upgrades. Puro, para servir tanto a UI quanto o tick.
export function calculaRegras(estado){
    const soma = {
        tempoCultivo: 0,
        valorVenda: 0,
        semErva: 0,
        taxaRefino: 0,
        dropAdubo: 0,
        duracaoFertilizante: 0,
    };

    (estado.tripulacao || []).forEach(function (id) {
        const dadosFazenda = buscaPersonagem(id).fazenda;

        if(!dadosFazenda){
            return;
        }

        soma[dadosFazenda.efeito] += dadosFazenda.efeito === "semErva"
            ? 1
            : forcaDoBonus(dadosFazenda.valorBase, progressoDoPiloto(estado, id).nivel);
    });

    const niveis = estado.upgrades;
    const riscoZerado = soma.semErva > 0 || niveis.refinador >= 2;

    return {
        ...soma,
        tempoRefino: TEMPO_REFINO_BASE * Math.pow(0.82, niveis.refinador) / (1 + soma.taxaRefino),
        multiplicadorCultivo: Math.pow(0.92, niveis.uv) * (1 - Math.min(0.6, soma.tempoCultivo)),
        multiplicadorVenda: (1 + (0.1 * niveis.irrigacao)) * (1 + soma.valorVenda),
        riscoErva: riscoZerado ? 0 : RISCO_ERVA_BASE,
        capacidadeAdubo: CAPACIDADE_TANQUE_BASE + (CAPACIDADE_POR_NIVEL * niveis.tanque),
        vagasTripulacao: VAGAS_TRIPULACAO_BASE + niveis.alojamento,
        lotesLiberados: LOTES_INICIAIS + (LOTES_POR_EXPANSAO * niveis.terreno),
        autoColheita: niveis.autoColheita > 0,
        duracaoTurbo: DURACAO_FERTILIZANTE_TURBO * (1 + soma.duracaoFertilizante),
    };
}

// Avanca o meta-game em `dt` ms. Usado pelo relogio e pelo ganho offline.
export function avanca(atual, dt, regras){
    if(dt <= 0){
        return atual;
    }

    let creditos = atual.creditos;
    let aduboRefinado = atual.aduboRefinado;
    let fila = atual.refino.fila;
    let progressoRefino = atual.refino.progresso;
    let mudou = false;

    if(fila > 0){
        progressoRefino += dt;
        mudou = true;

        while(fila > 0 && progressoRefino >= regras.tempoRefino){
            progressoRefino -= regras.tempoRefino;
            fila--;
            aduboRefinado++;
        }

        if(fila === 0){
            progressoRefino = 0;
        }
    }

    const agora = Date.now();
    const lotes = atual.lotes.map(function (lote) {
        if(lote.praga || !lote.cultura || lote.pronto){
            return lote;
        }

        const cultura = buscaCultura(lote.cultura);

        if(!cultura){
            return lote;
        }

        const turbo = lote.turboAte > agora ? 2 : 1;
        const progresso = lote.progresso + (dt * turbo);
        const necessario = cultura.tempo * regras.multiplicadorCultivo;

        mudou = true;

        if(progresso < necessario){
            return {...lote, progresso};
        }

        if(regras.autoColheita){
            const ciclos = Math.max(1, Math.floor(progresso / Math.max(1, necessario)));

            creditos += Math.round(cultura.valor * regras.multiplicadorVenda) * ciclos;
            return loteVazio(lote.id);
        }

        return {...lote, progresso: necessario, pronto: true};
    });

    const infectados = lotes.filter(function (lote) {
        return Boolean(lote.praga);
    }).length;

    if(infectados > 0 && creditos > 0){
        creditos = Math.max(0, creditos - (creditos * DRENO_ERVA_POR_SEGUNDO * infectados * (dt / 1000)));
        mudou = true;
    }

    if(!mudou){
        return atual;
    }

    return {
        ...atual,
        creditos,
        aduboRefinado,
        lotes,
        refino: {fila, progresso: progressoRefino},
    };
}

export function FazendaProvider(props){
    const [fazenda, setFazenda] = useState(estadoInicial);
    const [carregada, setCarregada] = useState(false);
    const fazendaRef = useRef(fazenda);

    fazendaRef.current = fazenda;

    useEffect(function () {
        const salvo = carregaSave();
        const decorrido = Math.min(
            MAXIMO_OFFLINE,
            Math.max(0, Date.now() - (salvo.atualizadoEm || Date.now()))
        );

        setFazenda(avanca(salvo, decorrido, calculaRegras(salvo)));
        setCarregada(true);
    }, []);

    useEffect(function () {
        if(!carregada || typeof window === "undefined"){
            return;
        }

        const gravar = window.setTimeout(function () {
            try {
                window.localStorage.setItem(CHAVE_SAVE, JSON.stringify(fazenda));
            } catch (erro) {
                // sem espaco no localStorage: seguir o jogo sem salvar
            }
        }, 400);

        return function () {
            window.clearTimeout(gravar);
        };
    }, [carregada, fazenda]);

    const tripulacaoAtiva = useMemo(function () {
        return fazenda.tripulacao.map(function (id) {
            const personagem = buscaPersonagem(id);
            const progresso = nivelDoPiloto((fazenda.pilotos[id] || {}).xp || 0);

            return {personagem, ...progresso};
        });
    }, [fazenda.pilotos, fazenda.tripulacao]);

    const bonus = useMemo(function () {
        return calculaRegras(fazenda);
    }, [fazenda]);

    const bonusRef = useRef(bonus);

    bonusRef.current = bonus;

    // Relogio do meta-game. Usa tempo real: aba em segundo plano nao congela a fazenda.
    useEffect(function () {
        if(!carregada){
            return;
        }

        let ultimoTick = Date.now();

        const relogio = setInterval(function () {
            const agora = Date.now();
            const dt = agora - ultimoTick;

            ultimoTick = agora;

            setFazenda(function (atual) {
                const proximo = avanca(atual, dt, bonusRef.current);

                return proximo === atual ? atual : {...proximo, atualizadoEm: agora};
            });
        }, TICK);

        return function () {
            clearInterval(relogio);
        };
    }, [carregada]);

    const enfileirarRefino = useCallback(function (quantidade) {
        setFazenda(function (atual) {
            const total = Math.min(quantidade, atual.aduboBruto);

            if(total <= 0){
                return atual;
            }

            return {
                ...atual,
                aduboBruto: atual.aduboBruto - total,
                refino: {...atual.refino, fila: atual.refino.fila + total},
            };
        });
    }, []);

    const plantar = useCallback(function (indiceLote, culturaId, usarBruto) {
        setFazenda(function (atual) {
            const cultura = buscaCultura(culturaId);
            const lote = atual.lotes[indiceLote];

            if(!cultura || !lote || lote.cultura || lote.praga){
                return atual;
            }

            const estoque = usarBruto ? atual.aduboBruto : atual.aduboRefinado;

            if(estoque < cultura.custoAdubo){
                return atual;
            }

            const nasceuErva = usarBruto && Math.random() < bonusRef.current.riscoErva;
            const lotes = atual.lotes.map(function (item, indice) {
                if(indice !== indiceLote){
                    return item;
                }

                if(nasceuErva){
                    return {
                        ...loteVazio(item.id),
                        praga: {cliques: 0, cliquesNecessarios: CLIQUES_PARA_BANIR},
                    };
                }

                return {...loteVazio(item.id), cultura: culturaId};
            });

            return {
                ...atual,
                aduboBruto: usarBruto ? atual.aduboBruto - cultura.custoAdubo : atual.aduboBruto,
                aduboRefinado: usarBruto ? atual.aduboRefinado : atual.aduboRefinado - cultura.custoAdubo,
                lotes,
            };
        });
    }, []);

    const colher = useCallback(function (indiceLote) {
        setFazenda(function (atual) {
            const lote = atual.lotes[indiceLote];

            if(!lote || !lote.pronto){
                return atual;
            }

            const cultura = buscaCultura(lote.cultura);

            if(!cultura){
                return atual;
            }

            return {
                ...atual,
                creditos: atual.creditos + Math.round(cultura.valor * bonusRef.current.multiplicadorVenda),
                lotes: atual.lotes.map(function (item, indice) {
                    return indice === indiceLote ? loteVazio(item.id) : item;
                }),
            };
        });
    }, []);

    const turbinar = useCallback(function (indiceLote) {
        setFazenda(function (atual) {
            const lote = atual.lotes[indiceLote];

            if(!lote || !lote.cultura || lote.pronto || lote.praga){
                return atual;
            }

            if(atual.aduboRefinado < CUSTO_FERTILIZANTE_TURBO){
                return atual;
            }

            return {
                ...atual,
                aduboRefinado: atual.aduboRefinado - CUSTO_FERTILIZANTE_TURBO,
                lotes: atual.lotes.map(function (item, indice) {
                    return indice === indiceLote
                        ? {...item, turboAte: Date.now() + bonusRef.current.duracaoTurbo}
                        : item;
                }),
            };
        });
    }, []);

    const baterNaErva = useCallback(function (indiceLote) {
        setFazenda(function (atual) {
            const lote = atual.lotes[indiceLote];

            if(!lote || !lote.praga){
                return atual;
            }

            const cliques = lote.praga.cliques + 1;

            return {
                ...atual,
                lotes: atual.lotes.map(function (item, indice) {
                    if(indice !== indiceLote){
                        return item;
                    }

                    if(cliques >= item.praga.cliquesNecessarios){
                        return loteVazio(item.id);
                    }

                    return {...item, praga: {...item.praga, cliques}};
                }),
            };
        });
    }, []);

    const comprarUpgrade = useCallback(function (upgradeId) {
        setFazenda(function (atual) {
            const upgrade = UPGRADES.find(function (item) {
                return item.id === upgradeId;
            });

            if(!upgrade){
                return atual;
            }

            const nivel = atual.upgrades[upgradeId] || 0;

            if(nivel >= upgrade.max){
                return atual;
            }

            const preco = custoUpgrade(upgrade, nivel);

            if(atual.creditos < preco){
                return atual;
            }

            return {
                ...atual,
                creditos: atual.creditos - preco,
                upgrades: {...atual.upgrades, [upgradeId]: nivel + 1},
            };
        });
    }, []);

    const alternarTripulante = useCallback(function (pilotoId) {
        setFazenda(function (atual) {
            const escalado = atual.tripulacao.includes(pilotoId);

            if(escalado){
                return {
                    ...atual,
                    tripulacao: atual.tripulacao.filter(function (id) {
                        return id !== pilotoId;
                    }),
                };
            }

            if(atual.tripulacao.length >= bonusRef.current.vagasTripulacao){
                return atual;
            }

            return {...atual, tripulacao: [...atual.tripulacao, pilotoId]};
        });
    }, []);

    // Chamado no fim de cada run do space shooter.
    const registrarRun = useCallback(function (resultado) {
        const pilotoId = resultado.pilotoId;
        const piloto = buscaPersonagem(pilotoId);
        const extrator = piloto.fazenda && piloto.fazenda.efeito === "dropAdubo"
            ? 1 + piloto.fazenda.valorBase
            : 1;
        const adubo = Math.round(resultado.adubo * extrator);
        const xp = xpDaRun(resultado.lorenzos, resultado.pontos);
        let aduboCreditado = adubo;

        setFazenda(function (atual) {
            const capacidade = bonusRef.current.capacidadeAdubo;
            const total = Math.min(capacidade, atual.aduboBruto + adubo);

            aduboCreditado = total - atual.aduboBruto;

            const dadosPiloto = atual.pilotos[pilotoId] || {xp: 0, runs: 0};

            return {
                ...atual,
                aduboBruto: total,
                totalLorenzos: atual.totalLorenzos + resultado.lorenzos,
                pilotos: {
                    ...atual.pilotos,
                    [pilotoId]: {xp: dadosPiloto.xp + xp, runs: dadosPiloto.runs + 1},
                },
                ultimoRun: {
                    pilotoId,
                    lorenzos: resultado.lorenzos,
                    pontos: resultado.pontos,
                    adubo,
                    xp,
                },
            };
        });

        return {adubo, xp, aduboCreditado};
    }, []);

    const zerarFazenda = useCallback(function () {
        setFazenda(estadoInicial());
    }, []);

    const valor = {
        fazenda,
        carregada,
        bonus,
        tripulacaoAtiva,
        enfileirarRefino,
        plantar,
        colher,
        turbinar,
        baterNaErva,
        comprarUpgrade,
        alternarTripulante,
        registrarRun,
        zerarFazenda,
    };

    return (
        <FazendaContext.Provider value={valor}>
            {props.children}
        </FazendaContext.Provider>
    );
}

export function useFazenda(){
    return useContext(FazendaContext);
}
