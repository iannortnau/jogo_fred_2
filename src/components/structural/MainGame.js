import {useState} from "react";
import styles from "../../styles/components/Arena.module.css"
import Item from "../Item";
import Player from "../entities/Player";
import Arena from "../ornamental/Arena";

export default function MainGame(props) {
    const [lista, setLista] = useState([<Item nome={0} onClick={clink} key={0}/>]);
    const [update, setUpdate] = useState(1);


    function clink(){
        lista.push(<Item nome={lista.length} onClick={clink} key={lista.length}/>);
        setUpdate(lista.length);
        console.log(update);
        setLista(lista);
    }


    return (
        <Arena>
            <Player/>
            {/*lista.map(function (item,index) {
                return(item);
            })*/}
        </Arena>
    )
}
