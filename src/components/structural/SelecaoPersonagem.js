import {useCallback, useEffect, useRef, useState} from "react";
import Image from "next/image";
import Player from "../entities/Player";
import {PERSONAGENS} from "../../data/personagens";
import styles from "../../styles/components/Arena.module.css";

const COLUNAS = 3;

export default function SelecaoPersonagem(props) {
    const [indice, setIndice] = useState(0);
    const indiceRef = useRef(0);
    const onEscolher = props.onEscolher;

    useEffect(function () {
        indiceRef.current = indice;
    }, [indice]);

    const confirmar = useCallback(function (personagem) {
        onEscolher(personagem);
    }, [onEscolher]);

    useEffect(function () {
        function keyDown(e){
            const tecla = e.key.toLowerCase();

            if(["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", " ", "enter"].includes(tecla)){
                e.preventDefault();
            }

            if(tecla === "arrowleft" || tecla === "a"){
                setIndice(function (atual) {
                    return (atual - 1 + PERSONAGENS.length) % PERSONAGENS.length;
                });
            }

            if(tecla === "arrowright" || tecla === "d"){
                setIndice(function (atual) {
                    return (atual + 1) % PERSONAGENS.length;
                });
            }

            if(tecla === "arrowup" || tecla === "w"){
                setIndice(function (atual) {
                    return (atual - COLUNAS + PERSONAGENS.length) % PERSONAGENS.length;
                });
            }

            if(tecla === "arrowdown" || tecla === "s"){
                setIndice(function (atual) {
                    return (atual + COLUNAS) % PERSONAGENS.length;
                });
            }

            if(tecla === " " || tecla === "enter"){
                confirmar(PERSONAGENS[indiceRef.current]);
            }
        }

        document.addEventListener("keydown", keyDown);

        return function () {
            document.removeEventListener("keydown", keyDown);
        };
    }, [confirmar]);

    return (
        <div className={styles.selecao}>
            <div className={styles.selecaoTopo}>
                <strong>Escolha seu piloto</strong>
                <span>Cada piloto tem nave, foto e atributos proprios</span>
            </div>

            <div className={styles.selecaoGrade}>
                {PERSONAGENS.map(function (personagem, posicao) {
                    return (
                        <button
                            key={personagem.id}
                            type="button"
                            className={`${styles.cardPiloto} ${posicao === indice ? styles.cardPilotoAtivo : ""}`}
                            style={personagem.estiloNave}
                            onPointerEnter={function () {
                                setIndice(posicao);
                            }}
                            onClick={function () {
                                setIndice(posicao);
                                confirmar(personagem);
                            }}
                        >
                            <span className={styles.cardTopo}>
                                <span className={styles.cardFoto}>
                                    <Image
                                        src={personagem.foto}
                                        alt={personagem.nome}
                                        layout="fill"
                                        objectFit="cover"
                                        objectPosition="center center"
                                        priority
                                    />
                                </span>
                                <span className={styles.cardIdentidade}>
                                    <strong>{personagem.nome}</strong>
                                    <span className={styles.cardNave}>{personagem.nave}</span>
                                </span>
                            </span>

                            <span className={styles.cardPreviewNave}>
                                <span className={styles.cardPreviewPalco}>
                                    <Player
                                        x={0}
                                        y={0}
                                        largura={86}
                                        altura={58}
                                        personagem={personagem}
                                    />
                                </span>
                            </span>

                            <span className={styles.cardBarras}>
                                <span className={styles.cardBarraLinha}>
                                    <span className={styles.cardBarraNome}>Vel</span>
                                    <span className={styles.cardBarraTrilho}>
                                        <span style={{width: personagem.barras.velocidade + "%"}} />
                                    </span>
                                </span>
                                <span className={styles.cardBarraLinha}>
                                    <span className={styles.cardBarraNome}>Tiro</span>
                                    <span className={styles.cardBarraTrilho}>
                                        <span style={{width: personagem.barras.tiro + "%"}} />
                                    </span>
                                </span>
                                <span className={styles.cardBarraLinha}>
                                    <span className={styles.cardBarraNome}>Vida</span>
                                    <span className={styles.cardBarraTrilho}>
                                        <span style={{width: personagem.barras.vida + "%"}} />
                                    </span>
                                </span>
                            </span>

                            <span className={styles.cardExtra}>{personagem.extra}</span>
                        </button>
                    );
                })}
            </div>

            <div className={styles.selecaoRodape}>
                <span>{PERSONAGENS[indice].descricao}</span>
                <span className={styles.selecaoDica}>Toque no card ou use as setas e <kbd>Enter</kbd></span>
            </div>
        </div>
    )
}
