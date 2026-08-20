import {useCallback, useEffect, useRef, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import Player from "../entities/Player";
import ControlesMobile from "./ControlesMobile";
import {PERSONAGENS} from "../../data/personagens";
import styles from "../../styles/components/Arena.module.css";

const COLUNAS_DESKTOP = 3;
const COLUNAS_MOBILE = 2;

export default function SelecaoPersonagem(props) {
    const [indice, setIndice] = useState(0);
    const [colunas, setColunas] = useState(COLUNAS_DESKTOP);
    const indiceRef = useRef(0);
    const colunasRef = useRef(COLUNAS_DESKTOP);
    const cardsRef = useRef([]);
    const onEscolher = props.onEscolher;

    useEffect(function () {
        indiceRef.current = indice;

        const card = cardsRef.current[indice];

        if(card){
            card.scrollIntoView({block: "nearest"});
        }
    }, [indice]);

    useEffect(function () {
        function atualizaColunas(){
            const total = window.innerWidth <= 860 ? COLUNAS_MOBILE : COLUNAS_DESKTOP;

            colunasRef.current = total;
            setColunas(total);
        }

        atualizaColunas();
        window.addEventListener("resize", atualizaColunas);

        return function () {
            window.removeEventListener("resize", atualizaColunas);
        };
    }, []);

    const confirmar = useCallback(function (personagem) {
        onEscolher(personagem);
    }, [onEscolher]);

    const mover = useCallback(function (tecla) {
        const passo = colunasRef.current;

        setIndice(function (atual) {
            if(tecla === "a"){
                return (atual - 1 + PERSONAGENS.length) % PERSONAGENS.length;
            }

            if(tecla === "d"){
                return (atual + 1) % PERSONAGENS.length;
            }

            if(tecla === "w"){
                return (atual - passo + PERSONAGENS.length) % PERSONAGENS.length;
            }

            if(tecla === "s"){
                return (atual + passo) % PERSONAGENS.length;
            }

            return atual;
        });
    }, []);

    useEffect(function () {
        const DIRECOES = {
            arrowleft: "a",
            a: "a",
            arrowright: "d",
            d: "d",
            arrowup: "w",
            w: "w",
            arrowdown: "s",
            s: "s",
        };

        function keyDown(e){
            const tecla = e.key.toLowerCase();

            if(DIRECOES[tecla]){
                e.preventDefault();
                mover(DIRECOES[tecla]);
                return;
            }

            if(tecla === " " || tecla === "enter"){
                e.preventDefault();
                confirmar(PERSONAGENS[indiceRef.current]);
            }
        }

        document.addEventListener("keydown", keyDown);

        return function () {
            document.removeEventListener("keydown", keyDown);
        };
    }, [confirmar, mover]);

    const pressionarControle = useCallback(function (tecla, e) {
        e.preventDefault();

        if(tecla === " "){
            confirmar(PERSONAGENS[indiceRef.current]);
            return;
        }

        mover(tecla);
    }, [confirmar, mover]);

    const soltarControle = useCallback(function (tecla, e) {
        e.preventDefault();
    }, []);

    return (
        <div className={styles.gameLayout}>
            <div className={styles.selecao}>
                <div className={styles.selecaoTopo}>
                    <div className={styles.selecaoCabecalho}>
                        <strong>Escolha seu piloto</strong>
                        <Link href="/fazenda">
                            <a className={styles.linkFazenda}>🌿 Ir para a Fazenda</a>
                        </Link>
                    </div>
                    <span>Cada piloto tem nave, foto e atributos proprios</span>
                </div>

                <div
                    className={styles.selecaoGrade}
                    style={{gridTemplateColumns: "repeat(" + colunas + ", minmax(0, 1fr))"}}
                >
                    {PERSONAGENS.map(function (personagem, posicao) {
                        return (
                            <button
                                key={personagem.id}
                                ref={function (elemento) {
                                    cardsRef.current[posicao] = elemento;
                                }}
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
                    <span className={styles.selecaoDica}>Toque no card, use o controle ou as setas e <kbd>Enter</kbd></span>
                </div>
            </div>

            <ControlesMobile
                aoPressionar={pressionarControle}
                aoSoltar={soltarControle}
                rotuloAcao="JOGAR"
            />
        </div>
    )
}
