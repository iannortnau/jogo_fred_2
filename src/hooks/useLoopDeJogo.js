import {useEffect, useRef} from "react";

const MAXIMO_ACUMULADO = 400;
const MAXIMO_PASSOS = 20;

// Relogio de passo fixo: se o navegador atrasar, roda os passos que faltaram
// em vez de perder tempo de jogo. Mesmo motor para as fases e para a defesa.
export function useLoopDeJogo(ativo, intervalo, passo){
    const passoRef = useRef(passo);

    passoRef.current = passo;

    useEffect(function () {
        if(!ativo){
            return;
        }

        let ultimo = Date.now();
        let acumulado = 0;

        const relogio = setInterval(function () {
            const agora = Date.now();

            acumulado += Math.min(agora - ultimo, MAXIMO_ACUMULADO);
            ultimo = agora;

            let passos = 0;

            while(acumulado >= intervalo && passos < MAXIMO_PASSOS){
                acumulado -= intervalo;
                passos++;
            }

            for(let indice = 0; indice < passos; indice++){
                passoRef.current(intervalo);
            }
        }, intervalo);

        return function () {
            clearInterval(relogio);
        };
    }, [ativo, intervalo]);
}
