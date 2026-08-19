import {useEffect, useState} from "react";
import styles from "../../styles/components/Arena.module.css"

const LARGURA_ARENA = 800;
const ALTURA_ARENA = 600;
const ESPACO_VERTICAL_CONTROLES = 190;

function calculaEscalaArena(){
    if(typeof window === "undefined"){
        return 1;
    }

    const espacoVertical = window.innerWidth <= 860 ? ESPACO_VERTICAL_CONTROLES : 16;
    const escalaLargura = (window.innerWidth - 16) / LARGURA_ARENA;
    const escalaAltura = (window.innerHeight - espacoVertical) / ALTURA_ARENA;

    return Math.min(1, Math.max(0.38, Math.min(escalaLargura, escalaAltura)));
}

export default function Arena(props) {
    const [escala, setEscala] = useState(1);

    useEffect(function () {
        function atualizaEscala(){
            setEscala(calculaEscalaArena());
        }

        atualizaEscala();
        window.addEventListener("resize", atualizaEscala);

        return function () {
            window.removeEventListener("resize", atualizaEscala);
        };
    }, []);

    return (
        <div
            className={styles.stage}
            style={{
                width: (LARGURA_ARENA * escala) + "px",
                height: (ALTURA_ARENA * escala) + "px",
            }}
        >
            <div
                className={styles.arena}
                style={{transform: "scale(" + escala + ")"}}
            >
                {props.children}
            </div>
        </div>
    )
}
