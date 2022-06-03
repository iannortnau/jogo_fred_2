import {useState} from "react";
import styles from "../../styles/components/Arena.module.css"
import Item from "../Item";

export default function Arena(props) {
    const [lista, setLista] = useState([<Item nome={0} onClick={clink} key={0}/>]);
    const [update, setUpdate] = useState(1);


    function clink(){
        lista.push(<Item nome={lista.length} onClick={clink} key={lista.length}/>);
        setUpdate(lista.length);
        console.log(update);
        setLista(lista);
    }


    return (
        <div className={styles.arena}>
            {lista.map(function (item,index) {
                return(item);
            })}
        </div>
    )
}
