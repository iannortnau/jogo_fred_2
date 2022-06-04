import {useContext, useEffect, useState} from "react";
import {GameContext} from "../../contexts/gameContext";

let modificadorX = 0;
let modificadorY = 0;
export default function Player(props) {
    const {intervaloDeAtualizacao} = useContext(GameContext);
    const [x,setX] = useState(0);
    const [y,setY] = useState(0);
    const [update, setUpdate] = useState(1);

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
        setX(x+modificadorX);
        setY(y+modificadorY);
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



    return (
        <p
            style={{position:"relative",top:y+"px",left:x+"px"}}
        >
            a
        </p>
    )
}
