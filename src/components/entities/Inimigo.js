import styles from "../../styles/components/Arena.module.css";

export default function Inimigo(props) {
    return (
        <div
            className={styles.inimigoAsteroide}
            style={{
                top: props.y + "px",
                left: props.x + "px",
            }}
        >
            <span />
            <span />
        </div>
    )
}
