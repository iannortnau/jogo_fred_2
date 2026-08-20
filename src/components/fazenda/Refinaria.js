import {useFazenda} from "../../contexts/fazendaContext";
import {CAPACIDADE_TANQUE_BASE} from "../../data/fazenda";
import styles from "../../styles/components/Fazenda.module.css";

const LEDS = 12;
const RISCO_MAXIMO_PAINEL = 0.2;

export default function Refinaria() {
    const {fazenda, bonus, enfileirarRefino} = useFazenda();
    const fila = fazenda.refino.fila;
    const porcentagem = fila > 0
        ? Math.min(100, (fazenda.refino.progresso / bonus.tempoRefino) * 100)
        : 0;
    const risco = Math.round(bonus.riscoErva * 100);
    const porSegundo = 1000 / bonus.tempoRefino;
    const nivelBruto = Math.min(100, (fazenda.aduboBruto / bonus.capacidadeAdubo) * 100);
    const nivelRefinado = Math.min(100, (fazenda.aduboRefinado / CAPACIDADE_TANQUE_BASE) * 100);
    const ledsAcesos = Math.round((bonus.riscoErva / RISCO_MAXIMO_PAINEL) * LEDS);
    const anguloPonteiro = -120 + (Math.min(1, porSegundo / 1.5) * 240);

    return (
        <div className={styles.refinaria}>
            <div className={styles.maquina}>
                <div className={styles.maquinaVidros}>
                    <div className={styles.tanque}>
                        <span className={styles.tanqueTampa} />
                        <span className={styles.tanqueCorpo}>
                            <span
                                className={styles.tanqueNivelBruto}
                                style={{height: nivelBruto + "%"}}
                            />
                            <strong>{fazenda.aduboBruto}</strong>
                        </span>
                        <span className={styles.tanqueRotulo}>Bruto</span>
                    </div>

                    <div className={styles.encanamento}>
                        <span className={styles.canoAlto} />
                        <span className={styles.filtro}>
                            <span style={{height: Math.max(8, porcentagem) + "%"}} />
                        </span>
                        <span className={styles.valvula} />
                        <span className={styles.canoBaixo} />
                    </div>

                    <div className={styles.tanque}>
                        <span className={styles.tanqueTampa} />
                        <span className={styles.tanqueCorpo}>
                            <span
                                className={styles.tanqueNivelRefinado}
                                style={{height: nivelRefinado + "%"}}
                            />
                            <strong>{fazenda.aduboRefinado}</strong>
                        </span>
                        <span className={styles.tanqueRotulo}>Refinado</span>
                    </div>
                </div>

                <div className={styles.maquinaControles}>
                    <span className={styles.placaMetal}>ESTACAO DE REFINO</span>

                    <button
                        type="button"
                        className={styles.botaoLatao}
                        disabled={fazenda.aduboBruto < 1}
                        onClick={function () {
                            enfileirarRefino(10);
                        }}
                    >
                        REFINAR<br />10
                    </button>

                    <button
                        type="button"
                        className={`${styles.botaoLatao} ${styles.botaoLataoVerde}`}
                        disabled={fazenda.aduboBruto < 1}
                        onClick={function () {
                            enfileirarRefino(fazenda.aduboBruto);
                        }}
                    >
                        REFINAR<br />TUDO
                    </button>

                    <div className={styles.medidor}>
                        <span
                            className={styles.medidorPonteiro}
                            style={{transform: "rotate(" + anguloPonteiro + "deg)"}}
                        />
                        <span className={styles.medidorVisor}>{porSegundo.toFixed(2)} /s</span>
                    </div>
                </div>

                <div className={styles.maquinaRodape}>
                    <span className={styles.filaTexto}>Na fila: {fila}</span>
                    <span className={styles.progressoTrilho}>
                        <span style={{width: porcentagem + "%"}} />
                    </span>
                </div>
            </div>

            <div className={styles.blocoRisco}>
                <div className={styles.domo}>
                    <span className={styles.domoVidro} />
                    <span className={styles.domoPlanta}>🌿</span>
                    <span className={styles.domoTerra} />
                    <span className={styles.domoTexto}>{risco}%<em>bruto</em></span>
                </div>

                <div className={styles.riscoPainel}>
                    <strong className={styles.riscoTitulo}>PAINEL DE RISCO</strong>
                    <span className={styles.leds}>
                        {Array.from({length: LEDS}, function (item, indice) {
                            return (
                                <span
                                    key={indice}
                                    className={indice < ledsAcesos ? styles.ledAceso : styles.ledApagado}
                                    style={{"--led-cor": "hsl(" + (110 - (indice * 9)) + ", 85%, 52%)"}}
                                />
                            );
                        })}
                    </span>
                    <strong className={risco > 0 ? styles.riscoAlto : styles.riscoZero}>
                        {risco}% de chance por plantio com bruto
                    </strong>

                    <span className={styles.placaErva}>
                        <span className={styles.placaErvaIcone}>🌵</span>
                        <strong>ERVA DANINHA NEOLIBERAL</strong>
                        <span className={styles.blocoTexto}>
                            Refinador nivel 2 ou o Gusta escalado na seguranca zeram esse risco.
                        </span>
                    </span>
                </div>
            </div>
        </div>
    )
}
