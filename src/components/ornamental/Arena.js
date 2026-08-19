import styles from "../../styles/components/Arena.module.css"

export default function Arena(props) {
    return (
        <div className={styles.arena}>
            {props.children}
        </div>
    )
}
