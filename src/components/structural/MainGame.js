import {useCallback, useContext, useEffect, useRef, useState} from "react";
import { v1 as uuidv1 } from "uuid";
import Tiro1 from "../entities/Tiro1";
import Player from "../entities/Player";
import Arena from "../ornamental/Arena";
import Inimigo from "../entities/Inimigo";
import {GameContext} from "../../contexts/gameContext";
import styles from "../../styles/components/Arena.module.css";

const LARGURA_PLAYER = 86;
const ALTURA_PLAYER = 58;
const LARGURA_TIRO = 18;
const ALTURA_TIRO = 6;
const LARGURA_INIMIGO = 36;
const ALTURA_INIMIGO = 36;
const VIDA_INICIAL = 100;
const VELOCIDADE_PLAYER = 2;
const VELOCIDADE_TIRO = 5;
const DANO_INIMIGO = 20;
const DANO_ESCAPOU = 10;
const COOLDOWN_TIRO = 150;
const INTERVALO_SPAWN_BASE = 1100;
const MAX_INIMIGOS = 8;

function retangulosColidem(a, b){
    return (
        a.x < b.x + b.largura &&
        a.x + a.largura > b.x &&
        a.y < b.y + b.altura &&
        a.y + a.altura > b.y
    );
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

function criaEstadoInicial(larguraArena, alturaArena){
    return {
        player: {
            x: 40,
            y: Math.floor((alturaArena - ALTURA_PLAYER) / 2),
        },
        tiros: [],
        inimigos: [criaInimigo(larguraArena, alturaArena, 0, true)],
        vida: VIDA_INICIAL,
        pontos: 0,
        spawnTimer: 0,
        gameOver: false,
    };
}

export default function MainGame() {
    const {intervaloDeAtualizacao, larguraArena, alturaArena, limitaX, limitaY} = useContext(GameContext);
    const [jogo, setJogo] = useState(function () {
        return criaEstadoInicial(larguraArena, alturaArena);
    });
    const teclasPressionadasRef = useRef(new Set());
    const ultimoTiroRef = useRef(0);

    const reiniciar = useCallback(function () {
        teclasPressionadasRef.current.clear();
        ultimoTiroRef.current = 0;
        setJogo(criaEstadoInicial(larguraArena, alturaArena));
    }, [alturaArena, larguraArena]);

    const atira = useCallback(function () {
        const agora = Date.now();

        if(agora - ultimoTiroRef.current < COOLDOWN_TIRO){
            return;
        }

        ultimoTiroRef.current = agora;
        setJogo(function (estadoAtual) {
            if(estadoAtual.gameOver){
                return estadoAtual;
            }

            const novoTiro = {
                id: uuidv1(),
                x: estadoAtual.player.x + LARGURA_PLAYER,
                y: estadoAtual.player.y + (ALTURA_PLAYER / 2) - (ALTURA_TIRO / 2),
            };

            return {
                ...estadoAtual,
                tiros: [...estadoAtual.tiros, novoTiro],
            };
        });
    }, []);

    useEffect(function () {
        function keyDown(e){
            const tecla = e.key.toLowerCase();

            if(["w", "a", "s", "d", " "].includes(tecla)){
                e.preventDefault();
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
    }, [atira, jogo.gameOver, reiniciar]);

    useEffect(function () {
        if(jogo.gameOver){
            return;
        }

        const intervalo = setInterval(function () {
            setJogo(function (estadoAtual) {
                if(estadoAtual.gameOver){
                    return estadoAtual;
                }

                const teclas = teclasPressionadasRef.current;
                const direcaoX = (teclas.has("d") ? 1 : 0) - (teclas.has("a") ? 1 : 0);
                const direcaoY = (teclas.has("s") ? 1 : 0) - (teclas.has("w") ? 1 : 0);
                const normalizadorDiagonal = direcaoX !== 0 && direcaoY !== 0 ? Math.SQRT1_2 : 1;

                const player = {
                    x: limitaX(estadoAtual.player.x + (direcaoX * VELOCIDADE_PLAYER * normalizadorDiagonal), LARGURA_PLAYER),
                    y: limitaY(estadoAtual.player.y + (direcaoY * VELOCIDADE_PLAYER * normalizadorDiagonal), ALTURA_PLAYER),
                };

                let tiros = estadoAtual.tiros
                    .map(function (tiro) {
                        return {
                            ...tiro,
                            x: tiro.x + VELOCIDADE_TIRO,
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

                const tirosRemovidos = new Set();
                const inimigosRemovidos = new Set();
                let pontosGanhos = 0;

                tiros.forEach(function (tiro) {
                    inimigos.forEach(function (inimigo) {
                        if(tirosRemovidos.has(tiro.id) || inimigosRemovidos.has(inimigo.id)){
                            return;
                        }

                        const colidiu = retangulosColidem(
                            {...tiro, largura: LARGURA_TIRO, altura: ALTURA_TIRO},
                            {...inimigo, largura: LARGURA_INIMIGO, altura: ALTURA_INIMIGO}
                        );

                        if(colidiu){
                            tirosRemovidos.add(tiro.id);
                            inimigosRemovidos.add(inimigo.id);
                            pontosGanhos += 10;
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
                        danoRecebido += DANO_INIMIGO;
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

                const pontos = estadoAtual.pontos + pontosGanhos;
                const vida = Math.max(0, estadoAtual.vida - danoRecebido);
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
                    vida,
                    pontos,
                    spawnTimer,
                    gameOver: vida <= 0,
                };
            });
        }, intervaloDeAtualizacao);

        return function () {
            clearInterval(intervalo);
        };
    }, [alturaArena, intervaloDeAtualizacao, jogo.gameOver, larguraArena, limitaX, limitaY]);

    return (
        <Arena>
            <div className={styles.hud}>
                <div className={styles.vidaGrupo}>
                    <span className={styles.hudLabel}>Vida</span>
                    <div className={styles.vidaBarra}>
                        <span style={{width: jogo.vida + "%"}} />
                    </div>
                    <span className={styles.vidaTexto}>{jogo.vida}</span>
                </div>
                <strong className={styles.pontos}>Pontos: {jogo.pontos}</strong>
            </div>

            <Player
                x={jogo.player.x}
                y={jogo.player.y}
                largura={LARGURA_PLAYER}
                altura={ALTURA_PLAYER}
            />

            {jogo.tiros.map(function (tiro) {
                return (
                    <Tiro1
                        key={tiro.id}
                        x={tiro.x}
                        y={tiro.y}
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

            {jogo.gameOver && (
                <div className={styles.gameOver}>
                    <strong>Fim de jogo</strong>
                    <span>Pontos: {jogo.pontos}</span>
                    <button type="button" onClick={reiniciar}>Reiniciar</button>
                </div>
            )}
        </Arena>
    )
}
