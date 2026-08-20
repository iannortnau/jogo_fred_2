import Image from "next/image";
import {PERSONAGENS} from "../../data/personagens";
import {nivelDoPiloto} from "../../data/fazenda";
import {useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Fazenda.module.css";

export default function Tripulacao() {
    const {fazenda, bonus, alternarTripulante} = useFazenda();
    const escalados = fazenda.tripulacao.length;

    return (
        <div className={styles.painel}>
            <div className={styles.vagasAviso}>
                <strong>Escala da tripulacao</strong>
                <span>
                    {escalados} de {bonus.vagasTripulacao} vagas ocupadas · compre Alojamento na loja para abrir mais
                </span>
            </div>

            <div className={styles.tripulacao}>
                {PERSONAGENS.map(function (personagem) {
                    const dados = fazenda.pilotos[personagem.id] || {xp: 0, runs: 0};
                    const progresso = nivelDoPiloto(dados.xp);
                    const escalado = fazenda.tripulacao.includes(personagem.id);
                    const semVaga = !escalado && escalados >= bonus.vagasTripulacao;
                    const porcentagem = (progresso.xpNoNivel / progresso.xpDoNivel) * 100;

                    return (
                        <div
                            key={personagem.id}
                            className={`${styles.cardTripulante} ${escalado ? styles.cardTripulanteAtivo : ""}`}
                            style={personagem.estiloNave}
                        >
                            <div className={styles.tripulanteTopo}>
                                <span className={styles.tripulanteFoto}>
                                    <Image
                                        src={personagem.foto}
                                        alt={personagem.nome}
                                        layout="fill"
                                        objectFit="cover"
                                        objectPosition="center center"
                                    />
                                </span>
                                <div className={styles.tripulanteIdentidade}>
                                    <strong>{personagem.nome}</strong>
                                    <span className={styles.tripulantePapel}>
                                        {personagem.fazenda.icone} {personagem.fazenda.papel}
                                    </span>
                                </div>
                                <span className={styles.tripulanteNivel}>Nv {progresso.nivel}</span>
                            </div>

                            <span className={styles.blocoTexto}>{personagem.fazenda.descricao}</span>

                            <span className={styles.progressoTrilho}>
                                <span style={{width: porcentagem + "%"}} />
                            </span>
                            <span className={styles.tripulanteXp}>
                                XP {progresso.xpNoNivel}/{progresso.xpDoNivel} · {dados.runs} runs
                            </span>

                            <button
                                type="button"
                                className={escalado ? styles.botaoDispensar : styles.botaoEscalar}
                                disabled={semVaga}
                                onClick={function () {
                                    alternarTripulante(personagem.id);
                                }}
                            >
                                {escalado ? "Dispensar" : semVaga ? "Sem vaga" : "Escalar"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
