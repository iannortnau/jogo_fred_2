import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import CampoDefesa from "./CampoDefesa";
import {FASES, comandoDoPiloto} from "../../data/defesa";
import {PERSONAGENS} from "../../data/personagens";
import {nivelDoPiloto} from "../../data/fazenda";
import {useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Defesa.module.css";

export default function Defesa() {
    const {fazenda, carregada} = useFazenda();
    const [faseEscolhida, setFaseEscolhida] = useState(null);
    const [comandanteId, setComandanteId] = useState(PERSONAGENS[0].id);

    if(!carregada){
        return (
            <div className={styles.selecaoDefesa}>
                <span className={styles.blocoTexto}>Preparando a horta...</span>
            </div>
        )
    }

    const vencidas = fazenda.defesa.fasesVencidas;
    const comandante = PERSONAGENS.find(function (personagem) {
        return personagem.id === comandanteId;
    }) || PERSONAGENS[0];

    if(faseEscolhida){
        return (
            <CampoDefesa
                fase={faseEscolhida}
                comandante={comandante}
                jaVencida={vencidas.includes(faseEscolhida.id)}
                aoSair={function () {
                    setFaseEscolhida(null);
                }}
            />
        )
    }

    const cartas = Object.keys(fazenda.superPlantas).reduce(function (soma, id) {
        return soma + fazenda.superPlantas[id];
    }, 0);

    return (
        <div className={styles.selecaoDefesa}>
            <div className={styles.selecaoTopo}>
                <div>
                    <strong className={styles.titulo}>Ganja vs Lorenzo</strong>
                    <span className={styles.blocoTexto}>
                        Segure a passeata antes que ela chegue na cerca. Voce tem {cartas} Super Planta(s) no arsenal.
                    </span>
                </div>
                <div className={styles.topoBotoes}>
                    <Link href="/fazenda">
                        <a className={styles.botaoFazenda}>🌿 Fazenda</a>
                    </Link>
                    <Link href="/">
                        <a className={styles.botaoNave}>🚀 Fases</a>
                    </Link>
                </div>
            </div>

            <div className={styles.grupo}>
                <strong className={styles.grupoTitulo}>Comandante da defesa</strong>
                <div className={styles.comandantes}>
                    {PERSONAGENS.map(function (personagem) {
                        const comando = comandoDoPiloto(personagem);
                        const progresso = nivelDoPiloto((fazenda.pilotos[personagem.id] || {}).xp || 0);

                        return (
                            <button
                                key={personagem.id}
                                type="button"
                                className={`${styles.comandante} ${personagem.id === comandanteId ? styles.comandanteAtivo : ""}`}
                                style={personagem.estiloNave}
                                onClick={function () {
                                    setComandanteId(personagem.id);
                                }}
                            >
                                <span className={styles.comandanteFoto}>
                                    <Image
                                        src={personagem.foto}
                                        alt={personagem.nome}
                                        layout="fill"
                                        objectFit="cover"
                                        objectPosition="center center"
                                    />
                                </span>
                                <span className={styles.comandanteNome}>{personagem.nome}</span>
                                <span className={styles.comandanteNivel}>Nv {progresso.nivel}</span>
                                <span className={styles.comandanteBonus}>{comando.rotulo}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.grupo}>
                <strong className={styles.grupoTitulo}>Fases</strong>
                <div className={styles.fases}>
                    {FASES.map(function (fase, indice) {
                        const liberada = indice === 0 || vencidas.includes(FASES[indice - 1].id);
                        const vencida = vencidas.includes(fase.id);

                        return (
                            <button
                                key={fase.id}
                                type="button"
                                className={`${styles.fase} ${liberada ? "" : styles.faseBloqueada}`}
                                disabled={!liberada}
                                onClick={function () {
                                    setFaseEscolhida(fase);
                                }}
                            >
                                <span className={styles.faseNumero}>{liberada ? "Fase " + fase.id : "🔒"}</span>
                                <strong>{fase.nome}</strong>
                                <span className={styles.blocoTexto}>{fase.descricao}</span>
                                <span className={styles.faseSelo}>
                                    {vencida ? "Vencida · recompensa reduzida" : liberada ? "Nova" : "Vença a fase anterior"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
