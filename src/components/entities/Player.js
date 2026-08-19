import Image from "next/image";
import styles from "../../styles/components/Arena.module.css";

export default function Player(props) {
    return (
        <div
            className={`${styles.playerShip} ${props.escudoAtivo ? styles.playerShieldActive : ""} ${props.superAtivo ? styles.playerSuperActive : ""}`}
            style={{
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
                    src="/images/fred.png"
                    alt="Fred"
                    layout="fill"
                    objectFit="contain"
                    objectPosition="center center"
                    priority
                />
            </div>
        </div>
    )
}
