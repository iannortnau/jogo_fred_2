import Image from "next/image";
import styles from "../../styles/components/Arena.module.css";

const LABELS = {
    vida: "+",
    tiroDuplo: "x2",
    escudo: "S",
    super: "",
};

export default function PowerUp(props) {
    const isSuper = props.tipo === "super";

    return (
        <div
            className={`${styles.powerUp} ${styles["powerUp" + props.tipo]}`}
            style={{
                top: props.y + "px",
                left: props.x + "px",
            }}
        >
            {isSuper ? (
                <Image
                    src="/images/power-up-super.png"
                    alt="Power-up super"
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center center"
                    priority
                />
            ) : LABELS[props.tipo]}
        </div>
    )
}
