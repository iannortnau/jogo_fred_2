import {useContext, useEffect, useState} from "react";
import {GameContext} from "../../contexts/gameContext";

export default function Tiro1(props) {
    const {intervaloDeAtualizacao, verificaParedeExternasX, verificaParedeExternasY} = useContext(GameContext);
    const [update, setUpdate] = useState(1);
    const [x,setX] = useState(props.x);
    const [y,setY] = useState(props.y);
    const [nome,setNome] = useState(props.nome);

    useEffect(function () {
        movimenta();
        console.log("A");
        setTimeout(function () {
            setUpdate(update*-1);
        },intervaloDeAtualizacao);
    },[update]);

    function movimenta(){
        const auxX = x+1;
        if(verificaParedeExternasX(auxX,30)){
            setX(auxX);
        }
    }

    function clink(){
        props.onClick();
    }

    return (
        <button
            style={{position:"absolute",top:y+"px",left:x+"px"}}
            key={props.nome}
        >
            {nome}
        </button>
    )
}
