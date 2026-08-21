import {useCallback, useEffect, useRef} from "react";

const DIRECOES = ["w", "a", "s", "d"];

// Entrada compartilhada: WASD + espaco no teclado e d-pad + A no controle mobile.
export function useEntradaJogo(opcoes){
    const {ativo, aoAcao, aoTecla, aoInteragir, repetirAcao} = opcoes;
    const teclasRef = useRef(new Set());
    const repeticaoRef = useRef(null);
    const aoAcaoRef = useRef(aoAcao);
    const aoTeclaRef = useRef(aoTecla);
    const aoInteragirRef = useRef(aoInteragir);
    const repetirRef = useRef(repetirAcao);

    aoAcaoRef.current = aoAcao;
    aoTeclaRef.current = aoTecla;
    aoInteragirRef.current = aoInteragir;
    repetirRef.current = repetirAcao;

    const pararRepeticao = useCallback(function () {
        if(repeticaoRef.current && typeof window !== "undefined"){
            window.clearInterval(repeticaoRef.current);
            repeticaoRef.current = null;
        }
    }, []);

    const limpaTeclas = useCallback(function () {
        teclasRef.current.clear();
        pararRepeticao();
    }, [pararRepeticao]);

    const direcao = useCallback(function () {
        const teclas = teclasRef.current;
        const x = (teclas.has("d") ? 1 : 0) - (teclas.has("a") ? 1 : 0);
        const y = (teclas.has("s") ? 1 : 0) - (teclas.has("w") ? 1 : 0);
        const normalizador = x !== 0 && y !== 0 ? Math.SQRT1_2 : 1;

        return {x: x * normalizador, y: y * normalizador};
    }, []);

    useEffect(function () {
        if(!ativo){
            return;
        }

        function keyDown(e){
            const tecla = e.key.toLowerCase();

            if(DIRECOES.includes(tecla) || tecla === " "){
                e.preventDefault();

                if(aoInteragirRef.current){
                    aoInteragirRef.current();
                }
            }

            if(DIRECOES.includes(tecla)){
                teclasRef.current.add(tecla);
                return;
            }

            if(tecla === " "){
                if(aoAcaoRef.current){
                    aoAcaoRef.current();
                }

                return;
            }

            if(aoTeclaRef.current){
                aoTeclaRef.current(tecla);
            }
        }

        function keyUp(e){
            const tecla = e.key.toLowerCase();

            if(DIRECOES.includes(tecla)){
                teclasRef.current.delete(tecla);
            }
        }

        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);

        return function () {
            document.removeEventListener("keydown", keyDown);
            document.removeEventListener("keyup", keyUp);
        };
    }, [ativo]);

    useEffect(function () {
        return function () {
            pararRepeticao();
        };
    }, [pararRepeticao]);

    const pressionarControle = useCallback(function (tecla, e) {
        e.preventDefault();

        if(aoInteragirRef.current){
            aoInteragirRef.current();
        }

        if(tecla === " "){
            if(aoAcaoRef.current){
                aoAcaoRef.current();
            }

            if(repetirRef.current > 0 && !repeticaoRef.current && typeof window !== "undefined"){
                repeticaoRef.current = window.setInterval(function () {
                    if(aoAcaoRef.current){
                        aoAcaoRef.current();
                    }
                }, repetirRef.current);
            }

            return;
        }

        teclasRef.current.add(tecla);
    }, []);

    const soltarControle = useCallback(function (tecla, e) {
        e.preventDefault();

        if(tecla === " "){
            pararRepeticao();
            return;
        }

        teclasRef.current.delete(tecla);
    }, [pararRepeticao]);

    return {teclasRef, direcao, pressionarControle, soltarControle, limpaTeclas, pararRepeticao};
}
