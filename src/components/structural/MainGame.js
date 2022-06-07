import {useState} from "react";
import Tiro1 from "../entities/Tiro1";
import Player from "../entities/Player";
import Arena from "../ornamental/Arena";

export default function MainGame(props) {
    const [lista, setLista] = useState([<Tiro1 nome={0} onClick={clink} key={0}/>]);
    const [update, setUpdate] = useState(1);


    function clink(){
        lista.push(<Tiro1 nome={lista.length} onClick={clink} key={lista.length}/>);
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
