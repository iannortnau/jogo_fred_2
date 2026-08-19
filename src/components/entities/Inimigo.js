import Image from "next/image";
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
            <Image
                src="/images/inimigo.png"
                alt="Inimigo"
                layout="fill"
                objectFit="cover"
                objectPosition="center center"
                priority
            />
        </div>
    )
}
