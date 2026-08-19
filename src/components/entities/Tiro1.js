import styles from "../../styles/components/Arena.module.css";

export default function Tiro1(props) {
    return (
        <span
            className={`${styles.laser} ${props.super ? styles.superLaser : ""}`}
            style={{
                top: props.y + "px",
                left: props.x + "px",
            }}
        />
    )
}
