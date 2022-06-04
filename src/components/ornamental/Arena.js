import {useState} from "react";
import styles from "../../styles/components/Arena.module.css"
import Item from "../Item";
import Player from "../entities/Player";

export default function Arena(props) {
    return (
        <div className={styles.arena}>
            {props.children}
        </div>
    )
}
