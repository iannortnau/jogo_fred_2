import {useCallback, useContext, useEffect, useRef, useState} from "react";
import Image from "next/image";
import { v1 as uuidv1 } from "uuid";
import Tiro1 from "../entities/Tiro1";
import Player from "../entities/Player";
import Arena from "../ornamental/Arena";
import Inimigo from "../entities/Inimigo";
import PowerUp from "../entities/PowerUp";
import SelecaoPersonagem from "./SelecaoPersonagem";
import {GameContext} from "../../contexts/gameContext";
import {PERSONAGEM_PADRAO} from "../../data/personagens";
import styles from "../../styles/components/Arena.module.css";
import {useGameAudio} from "../../hooks/useGameAudio";

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

function retangulosColidem(a, b){
    return (
        a.x < b.x + b.largura &&
        a.x + a.largura > b.x &&
        a.y < b.y + b.altura &&
        a.y + a.altura > b.y
    );
}

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

function criaPowerUp(x, y){
    const tipo = TIPOS_POWER_UP[Math.floor(Math.random() * TIPOS_POWER_UP.length)];

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
    const teclasPressionadasRef = useRef(new Set());
    const ultimoTiroRef = useRef(0);
    const tiroControleRef = useRef(null);

    const pararTiroControle = useCallback(function () {
        if(tiroControleRef.current && typeof window !== "undefined"){
            window.clearInterval(tiroControleRef.current);
            tiroControleRef.current = null;
        }
    }, []);

    const reiniciar = useCallback(function () {
        teclasPressionadasRef.current.clear();
        pararTiroControle();
        ultimoTiroRef.current = 0;
        setJogo(criaEstadoInicial(larguraArena, alturaArena, personagem));
    }, [alturaArena, larguraArena, pararTiroControle, personagem]);

    const escolherPersonagem = useCallback(function (novoPersonagem) {
        teclasPressionadasRef.current.clear();
        pararTiroControle();
        ultimoTiroRef.current = 0;
        registrarInteracao();
        setPersonagem(novoPersonagem);
        setJogo(criaEstadoInicial(larguraArena, alturaArena, novoPersonagem));
    }, [alturaArena, larguraArena, pararTiroControle, registrarInteracao]);

    const trocarPersonagem = useCallback(function () {
        teclasPressionadasRef.current.clear();
        pararTiroControle();
        ultimoTiroRef.current = 0;
        setPersonagem(null);
    }, [pararTiroControle]);

    const atira = useCallback(function () {
        const agora = Date.now();
        const efeitosAtivos = jogo.efeitos || {tiroDuplo: 0, escudo: 0, super: 0};
        const cadencia = atributosDe(personagem).cadencia;
        const cooldownAtual = (efeitosAtivos.super > 0 ? COOLDOWN_SUPER : COOLDOWN_TIRO) * cadencia;

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
    }, [jogo.efeitos, jogo.gameOver, personagem, tocarTiro]);

    useEffect(function () {
        if(!personagem){
            return;
        }

        function keyDown(e){
            const tecla = e.key.toLowerCase();

            if(["w", "a", "s", "d", " "].includes(tecla)){
                e.preventDefault();
                registrarInteracao();
            }

            if(["w", "a", "s", "d"].includes(tecla)){
                teclasPressionadasRef.current.add(tecla);
            }

            if(e.key === " "){
                atira();
            }

            if(tecla === "r" && jogo.gameOver){
                reiniciar();
            }

            if(tecla === "t"){
                trocarPersonagem();
            }
        }

        function keyUp(e){
            const tecla = e.key.toLowerCase();

            if(["w", "a", "s", "d"].includes(tecla)){
                teclasPressionadasRef.current.delete(tecla);
            }
        }

        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);

        return function () {
            document.removeEventListener("keydown", keyDown);
            document.removeEventListener("keyup", keyUp);
        };
    }, [atira, jogo.gameOver, personagem, registrarInteracao, reiniciar, trocarPersonagem]);

    const pressionarControle = useCallback(function (tecla, e) {
        e.preventDefault();
        registrarInteracao();

        if(tecla === " "){
            atira();

            if(!tiroControleRef.current && typeof window !== "undefined"){
                const cadencia = atributosDe(personagem).cadencia;

                tiroControleRef.current = window.setInterval(atira, (COOLDOWN_TIRO * cadencia) + 30);
            }

            return;
        }

        teclasPressionadasRef.current.add(tecla);
    }, [atira, personagem, registrarInteracao]);

    const soltarControle = useCallback(function (tecla, e) {
        e.preventDefault();

        if(tecla === " "){
            pararTiroControle();
            return;
        }

        teclasPressionadasRef.current.delete(tecla);
    }, [pararTiroControle]);

    useEffect(function () {
        return function () {
            pararTiroControle();
        };
    }, [pararTiroControle]);

    useEffect(function () {
        if(!personagem || jogo.gameOver){
            return;
        }

        const atributos = atributosDe(personagem);

        const intervalo = setInterval(function () {
            setJogo(function (estadoAtual) {
                if(estadoAtual.gameOver){
                    return estadoAtual;
                }

                const teclas = teclasPressionadasRef.current;
                const direcaoX = (teclas.has("d") ? 1 : 0) - (teclas.has("a") ? 1 : 0);
                const direcaoY = (teclas.has("s") ? 1 : 0) - (teclas.has("w") ? 1 : 0);
                const normalizadorDiagonal = direcaoX !== 0 && direcaoY !== 0 ? Math.SQRT1_2 : 1;

                const efeitosAtuais = estadoAtual.efeitos || {tiroDuplo: 0, escudo: 0, super: 0};
                let efeitos = {
                    tiroDuplo: Math.max(0, efeitosAtuais.tiroDuplo - intervaloDeAtualizacao),
                    escudo: Math.max(0, efeitosAtuais.escudo - intervaloDeAtualizacao),
                    super: Math.max(0, efeitosAtuais.super - intervaloDeAtualizacao),
                };
                const velocidadeBase = VELOCIDADE_PLAYER * atributos.velocidade;
                const velocidadePlayer = efeitos.super > 0 ? velocidadeBase * 1.9 : velocidadeBase;

                const player = {
                    x: limitaX(estadoAtual.player.x + (direcaoX * velocidadePlayer * normalizadorDiagonal), LARGURA_PLAYER),
                    y: limitaY(estadoAtual.player.y + (direcaoY * velocidadePlayer * normalizadorDiagonal), ALTURA_PLAYER),
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

                            if(Math.random() < chancePowerUp){
                                novosPowerUps.push(criaPowerUp(inimigo.x, inimigo.y));
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

                let spawnTimer = estadoAtual.spawnTimer + intervaloDeAtualizacao;
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
                    spawnTimer,
                    gameOver: vida <= 0,
                };
            });
        }, intervaloDeAtualizacao);

        return function () {
            clearInterval(intervalo);
        };
    }, [alturaArena, intervaloDeAtualizacao, jogo.gameOver, larguraArena, limitaX, limitaY, personagem, tocarPowerUp]);

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
                        <div className={styles.gameOverBotoes}>
                            <button type="button" onClick={reiniciar}>Reiniciar</button>
                            <button type="button" onClick={trocarPersonagem}>Trocar piloto</button>
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

            <div className={styles.mobileControls} aria-label="Controles mobile">
                <div className={styles.dPad}>
                    <span />
                    <button
                        type="button"
                        onPointerDown={(e) => pressionarControle("w", e)}
                        onPointerUp={(e) => soltarControle("w", e)}
                        onPointerCancel={(e) => soltarControle("w", e)}
                        onPointerLeave={(e) => soltarControle("w", e)}
                    >
                        ^
                    </button>
                    <span />
                    <button
                        type="button"
                        onPointerDown={(e) => pressionarControle("a", e)}
                        onPointerUp={(e) => soltarControle("a", e)}
                        onPointerCancel={(e) => soltarControle("a", e)}
                        onPointerLeave={(e) => soltarControle("a", e)}
                    >
                        &lt;
                    </button>
                    <span className={styles.dPadCenter} />
                    <button
                        type="button"
                        onPointerDown={(e) => pressionarControle("d", e)}
                        onPointerUp={(e) => soltarControle("d", e)}
                        onPointerCancel={(e) => soltarControle("d", e)}
                        onPointerLeave={(e) => soltarControle("d", e)}
                    >
                        &gt;
                    </button>
                    <span />
                    <button
                        type="button"
                        onPointerDown={(e) => pressionarControle("s", e)}
                        onPointerUp={(e) => soltarControle("s", e)}
                        onPointerCancel={(e) => soltarControle("s", e)}
                        onPointerLeave={(e) => soltarControle("s", e)}
                    >
                        v
                    </button>
                    <span />
                </div>

                <div className={styles.fireCluster}>
                    <button
                        className={styles.fireButton}
                        type="button"
                        onPointerDown={(e) => pressionarControle(" ", e)}
                        onPointerUp={(e) => soltarControle(" ", e)}
                        onPointerCancel={(e) => soltarControle(" ", e)}
                        onPointerLeave={(e) => soltarControle(" ", e)}
                    >
                        A
                    </button>
                    <span>TIRO</span>
                </div>
            </div>
        </div>
    )
}
