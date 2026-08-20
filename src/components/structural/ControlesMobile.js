import styles from "../../styles/components/Arena.module.css";

// Controle que aparece no celular (CSS esconde ele acima de 860px).
// Serve tanto para a partida quanto para a tela de selecao de piloto.
export default function ControlesMobile(props) {
    const aoPressionar = props.aoPressionar;
    const aoSoltar = props.aoSoltar;

    function botaoDirecao(tecla, rotulo){
        return (
            <button
                type="button"
                onPointerDown={(e) => aoPressionar(tecla, e)}
                onPointerUp={(e) => aoSoltar(tecla, e)}
                onPointerCancel={(e) => aoSoltar(tecla, e)}
                onPointerLeave={(e) => aoSoltar(tecla, e)}
            >
                {rotulo}
            </button>
        );
    }

    return (
        <div className={styles.mobileControls} aria-label="Controles mobile">
            <div className={styles.dPad}>
                <span />
                {botaoDirecao("w", "^")}
                <span />
                {botaoDirecao("a", "<")}
                <span className={styles.dPadCenter} />
                {botaoDirecao("d", ">")}
                <span />
                {botaoDirecao("s", "v")}
                <span />
            </div>

            <div className={styles.fireCluster}>
                <button
                    className={styles.fireButton}
                    type="button"
                    onPointerDown={(e) => aoPressionar(" ", e)}
                    onPointerUp={(e) => aoSoltar(" ", e)}
                    onPointerCancel={(e) => aoSoltar(" ", e)}
                    onPointerLeave={(e) => aoSoltar(" ", e)}
                >
                    A
                </button>
                <span>{props.rotuloAcao || "TIRO"}</span>
            </div>
        </div>
    )
}
