import {createContext, useState} from "react";

export const GameContext = createContext({});

export function GameProvider(props){
    const [intervaloDeAtualizacao,setIntervaloDeAtualizacao] = useState(100);


    return (
        <GameContext.Provider
            value={{
                intervaloDeAtualizacao,
                setIntervaloDeAtualizacao
        }}>
            {props.children}
        </GameContext.Provider>
    );
}
