import {useEffect, useState} from "react";

export default function Item(props) {
    const [x,setX] = useState(0);
    const [y,setY] = useState(0);
    const [nome,setNome] = useState(props.nome);

    useEffect(function () {
        setTimeout(function () {
            const auxX = x+1;
            setX(auxX);
        },100);
    },[x])

    function clink(){
        props.onClick();
    }

    return (
        <button
            style={{position:"relative",top:x+"px",left:y+"px"}}
            key={props.nome}
            onClick={function (){
                clink();
            }}
        >
            {nome}
        </button>
    )
}
