import {useCallback, useEffect, useRef, useState} from "react";

const MELODIA = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 349.23];

export function useGameAudio(){
    const [audioAtivo, setAudioAtivo] = useState(true);
    const audioAtivoRef = useRef(true);
    const audioLiberadoRef = useRef(false);
    const contextoRef = useRef(null);
    const ganhoMasterRef = useRef(null);
    const musicaRef = useRef(null);
    const passoMusicaRef = useRef(0);

    const paraMusica = useCallback(function () {
        if(musicaRef.current && typeof window !== "undefined"){
            window.clearInterval(musicaRef.current);
            musicaRef.current = null;
        }
    }, []);

    const preparaAudio = useCallback(function () {
        if(typeof window === "undefined"){
            return null;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if(!AudioContext){
            return null;
        }

        if(!contextoRef.current){
            const contexto = new AudioContext();
            const ganhoMaster = contexto.createGain();

            ganhoMaster.gain.value = 0.18;
            ganhoMaster.connect(contexto.destination);
            contextoRef.current = contexto;
            ganhoMasterRef.current = ganhoMaster;
        }

        if(contextoRef.current.state === "suspended"){
            contextoRef.current.resume();
        }

        return contextoRef.current;
    }, []);

    const tocaNota = useCallback(function (frequencia, inicio, duracao) {
        const contexto = contextoRef.current;
        const ganhoMaster = ganhoMasterRef.current;

        if(!contexto || !ganhoMaster || !audioAtivoRef.current){
            return;
        }

        const oscilador = contexto.createOscillator();
        const ganho = contexto.createGain();

        oscilador.type = "triangle";
        oscilador.frequency.setValueAtTime(frequencia, inicio);
        ganho.gain.setValueAtTime(0.0001, inicio);
        ganho.gain.exponentialRampToValueAtTime(0.055, inicio + 0.03);
        ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

        oscilador.connect(ganho);
        ganho.connect(ganhoMaster);
        oscilador.start(inicio);
        oscilador.stop(inicio + duracao + 0.02);
    }, []);

    const tocaPassoMusica = useCallback(function () {
        if(!audioAtivoRef.current){
            return;
        }

        const contexto = preparaAudio();

        if(!contexto){
            return;
        }

        const inicio = contexto.currentTime;
        const frequencia = MELODIA[passoMusicaRef.current % MELODIA.length];

        tocaNota(frequencia, inicio, 0.22);

        if(passoMusicaRef.current % 4 === 0){
            tocaNota(frequencia / 2, inicio, 0.32);
        }

        passoMusicaRef.current++;
    }, [preparaAudio, tocaNota]);

    const iniciaMusica = useCallback(function () {
        if(!audioAtivoRef.current || musicaRef.current){
            return;
        }

        const contexto = preparaAudio();

        if(!contexto){
            return;
        }

        tocaPassoMusica();
        musicaRef.current = window.setInterval(tocaPassoMusica, 320);
    }, [preparaAudio, tocaPassoMusica]);

    const registrarInteracao = useCallback(function () {
        audioLiberadoRef.current = true;

        if(audioAtivoRef.current){
            iniciaMusica();
        }
    }, [iniciaMusica]);

    const tocarTiro = useCallback(function () {
        if(!audioAtivoRef.current){
            return;
        }

        audioLiberadoRef.current = true;
        const contexto = preparaAudio();

        if(!contexto || !ganhoMasterRef.current){
            return;
        }

        iniciaMusica();

        const inicio = contexto.currentTime;
        const oscilador = contexto.createOscillator();
        const ganho = contexto.createGain();

        oscilador.type = "square";
        oscilador.frequency.setValueAtTime(880, inicio);
        oscilador.frequency.exponentialRampToValueAtTime(220, inicio + 0.09);
        ganho.gain.setValueAtTime(0.0001, inicio);
        ganho.gain.exponentialRampToValueAtTime(0.12, inicio + 0.01);
        ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.12);

        oscilador.connect(ganho);
        ganho.connect(ganhoMasterRef.current);
        oscilador.start(inicio);
        oscilador.stop(inicio + 0.13);
    }, [iniciaMusica, preparaAudio]);

    const tocarPowerUp = useCallback(function () {
        if(!audioAtivoRef.current){
            return;
        }

        audioLiberadoRef.current = true;
        const contexto = preparaAudio();

        if(!contexto){
            return;
        }

        iniciaMusica();
        tocaNota(523.25, contexto.currentTime, 0.12);
        tocaNota(783.99, contexto.currentTime + 0.08, 0.18);
    }, [iniciaMusica, preparaAudio, tocaNota]);

    const alternarAudio = useCallback(function () {
        audioLiberadoRef.current = true;

        setAudioAtivo(function (ativoAtual) {
            const proximoAtivo = !ativoAtual;

            audioAtivoRef.current = proximoAtivo;

            if(!proximoAtivo){
                paraMusica();
            }

            return proximoAtivo;
        });
    }, [paraMusica]);

    useEffect(function () {
        audioAtivoRef.current = audioAtivo;

        if(!audioLiberadoRef.current){
            return;
        }

        if(audioAtivo){
            iniciaMusica();
            return;
        }

        paraMusica();
    }, [audioAtivo, iniciaMusica, paraMusica]);

    useEffect(function () {
        return function () {
            paraMusica();

            if(contextoRef.current){
                contextoRef.current.close();
            }
        };
    }, [paraMusica]);

    return {
        audioAtivo,
        alternarAudio,
        registrarInteracao,
        tocarPowerUp,
        tocarTiro,
    };
}
