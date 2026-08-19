import {createContext, useState} from "react";

export const GameContext = createContext({});

export function GameProvider(props){
    const [intervaloDeAtualizacao,setIntervaloDeAtualizacao] = useState(10);
    const larguraArena = 800;
    const alturaArena = 600;

    function verificaParedeExternasX(x,larguraEntidade){
        return x >= 0 && x <= larguraArena - larguraEntidade;
    }

    function verificaParedeExternasY(y,alturaEntidade){
        return y >= 0 && y <= alturaArena - alturaEntidade;
    }

    function limitaX(x, larguraEntidade){
        return Math.min(Math.max(x, 0), larguraArena - larguraEntidade);
    }

    function limitaY(y, alturaEntidade){
        return Math.min(Math.max(y, 0), alturaArena - alturaEntidade);
    }

    return (
        <GameContext.Provider
            value={{
                intervaloDeAtualizacao,
                setIntervaloDeAtualizacao,
                larguraArena,
                alturaArena,
                verificaParedeExternasX,
                verificaParedeExternasY,
                limitaX,
                limitaY
        }}>
            {props.children}
        </GameContext.Provider>
    );
}
