import Image from "next/image";
import styles from "../../styles/components/Arena.module.css";
import {PERSONAGEM_PADRAO} from "../../data/personagens";

export default function Player(props) {
    const personagem = props.personagem || PERSONAGEM_PADRAO;

    return (
        <div
            className={`${styles.playerShip} ${props.escudoAtivo ? styles.playerShieldActive : ""} ${props.superAtivo ? styles.playerSuperActive : ""}`}
            style={{
                ...personagem.estiloNave,
                top: props.y + "px",
                left: props.x + "px",
                width: props.largura + "px",
                height: props.altura + "px",
            }}
        >
            <span className={styles.playerThruster} />
            <span className={styles.playerWingTop} />
            <span className={styles.playerWingBottom} />
            <div className={styles.playerCockpit}>
                <Image
                    className={styles.fredHead}
                    src={personagem.foto}
                    alt={personagem.nome}
                    layout="fill"
                    objectFit="contain"
                    objectPosition="center center"
                    priority
                />
            </div>
        </div>
    )
}
