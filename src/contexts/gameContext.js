import {createContext, useState} from "react";

export const GameContext = createContext({});

export function GameProvider(props){
    const [intervaloDeAtualizacao,setIntervaloDeAtualizacao] = useState(10);

    function verificaParedeExternasX(x,larguraEntidade){
        if(x>=0 && x<=795-larguraEntidade){
            return true;
        }else return false;
    }
    function verificaParedeExternasY(y,alturaEntidade){
        if(y>=0 && y<=595-alturaEntidade){
            return true;
        }else return false;
    }


    return (
        <GameContext.Provider
            value={{
                intervaloDeAtualizacao,
                setIntervaloDeAtualizacao,
                verificaParedeExternasX,
                verificaParedeExternasY
        }}>
            {props.children}
        </GameContext.Provider>
    );
}
