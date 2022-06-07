import {useContext, useEffect, useState} from "react";
import {GameContext} from "../../contexts/gameContext";
import img from "../../../public/images/fred.png";
import Image from "next/image";
import Tiro1 from "./Tiro1";
import { v1 as uuidv1 } from 'uuid';

let modificadorX = 0;
let modificadorY = 0;
let tipoTiro = 0;
let posicaoAtualX = 0;
let posicaoAtualY = 0;

export default function Player(props) {
    const {intervaloDeAtualizacao, verificaParedeExternasX, verificaParedeExternasY} = useContext(GameContext);
    const [x,setX] = useState(0);
    const [y,setY] = useState(0);
    const [update, setUpdate] = useState(1);
    const [larguraPersonagem, setLarguraPersonagem] = useState(40);
    const [alturaPersonagem, setAlturaPersonagem] = useState(60);
    const [tirosTipo1, setTirosTipo1] = useState([]);

    useEffect(function () {
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);
    },[])

    useEffect(function () {
            movimenta();

        setTimeout(function () {
            setUpdate(update*-1);
        },intervaloDeAtualizacao);
    },[update]);

    function movimenta(){
        if(verificaParedeExternasX(x+modificadorX,larguraPersonagem)){
            const auxX = x+modificadorX;
            setX(auxX);
            posicaoAtualX = auxX;
        }
        if(verificaParedeExternasY(y+modificadorY,alturaPersonagem)){
            const auxY = y+modificadorY;
            setY(auxY);
            posicaoAtualY = auxY;
        }
    }

    function keyDown(e){
        const key = e.key;
        if(key === "w" || key === "W"){
            wDown();
        }
        if(key === "a" || key === "A"){
            aDown();
        }
        if(key === "s" || key === "S"){
            sDown();
        }
        if(key === "d" || key === "D"){
            dDown();
        }
        if(key === " "){
            atira();
        }
    }

    function keyUp(e){
        const key = e.key;
        if(key === "w" || key === "W"){
            wUp();
        }
        if(key === "a" || key === "A"){
            aUp();
        }
        if(key === "s" || key === "S"){
            sUp();
        }
        if(key === "d" || key === "D"){
            dUp();
        }
    }

    function wDown() {
        if(modificadorY !== -1){
            modificadorY--;
        }
    }
    function aDown() {
        if(modificadorX !== -1){
            modificadorX--;
        }
    }
    function sDown() {
        if(modificadorY !== 1){
            modificadorY++;
        }
    }
    function dDown() {
        if(modificadorX !== 1){
            modificadorX++;
        }
    }

    function wUp(){
        if(modificadorY !== 1){
            modificadorY++;
        }
    }
    function aUp(){
        if(modificadorX !== 1){
            modificadorX++;
        }
    }
    function sUp(){
        if(modificadorY !== -1){
            modificadorY--;
        }
    }
    function dUp(){
        if(modificadorX !== -1){
            modificadorX--;
        }
    }

    function atira(){
        if(tipoTiro === 0){
            tirosTipo1.push(uuidv1());
        }
    }


    return (
        <>
            <img
                style={{position:"relative",top:y+"px",left:x+"px"}}
                src="../../../images/fred.png"
                alt="Picture of the author"
                width={larguraPersonagem}
                height={alturaPersonagem}
            />
            {tirosTipo1.map(function (item,index) {
                return(
                    <Tiro1
                        key={item}
                        x={posicaoAtualX+40}
                        y={posicaoAtualY+30}
                        nome={"tiro"}
                    />
                )
            })}
        </>
    )
}
