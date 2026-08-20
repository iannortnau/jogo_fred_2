import {useState} from "react";
import {CULTURAS, CUSTO_FERTILIZANTE_TURBO} from "../../data/fazenda";
import {buscaCultura, useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Fazenda.module.css";

export default function Estufa() {
    const {fazenda, bonus, plantar, colher, turbinar, baterNaErva} = useFazenda();
    const [culturaEscolhida, setCulturaEscolhida] = useState(CULTURAS[0].id);
    const [usarBruto, setUsarBruto] = useState(false);

    const cultura = buscaCultura(culturaEscolhida);
    const estoque = usarBruto ? fazenda.aduboBruto : fazenda.aduboRefinado;
    const risco = usarBruto ? Math.round(bonus.riscoErva * 100) : 0;

    return (
        <div className={styles.painel}>
            <div className={styles.barraPlantio}>
                <div className={styles.chips}>
                    {CULTURAS.map(function (item) {
                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={`${styles.chip} ${item.id === culturaEscolhida ? styles.chipAtivo : ""}`}
                                style={{"--cultura-cor": item.cor}}
                                onClick={function () {
                                    setCulturaEscolhida(item.id);
                                }}
                            >
                                <span>{item.icone}</span>
                                {item.nome}
                                <strong>{item.custoAdubo} adubo</strong>
                            </button>
                        );
                    })}
                </div>

                <label className={styles.switchBruto}>
                    <input
                        type="checkbox"
                        checked={usarBruto}
                        onChange={function (e) {
                            setUsarBruto(e.target.checked);
                        }}
                    />
                    Usar adubo bruto
                    <span className={risco > 0 ? styles.riscoAlto : styles.riscoZero}>
                        risco de erva {risco}%
                    </span>
                </label>
            </div>

            <div className={styles.lotes}>
                {fazenda.lotes.map(function (lote, indice) {
                    if(indice >= bonus.lotesLiberados){
                        return (
                            <div key={lote.id} className={`${styles.lote} ${styles.loteBloqueado}`}>
                                <span className={styles.loteTitulo}>Lote {indice + 1}</span>
                                <span className={styles.loteIcone}>🔒</span>
                                <span className={styles.loteEstado}>
                                    Compre Expansao de Terreno na aba Upgrades
                                </span>
                            </div>
                        );
                    }

                    if(lote.praga){
                        const faltam = lote.praga.cliquesNecessarios - lote.praga.cliques;

                        return (
                            <div key={lote.id} className={`${styles.lote} ${styles.loteInfectado}`}>
                                <span className={styles.loteTitulo}>Lote {indice + 1}</span>
                                <span className={styles.ervaIcone}>🌵</span>
                                <strong className={styles.ervaNome}>Erva Daninha Neoliberal</strong>
                                <span className={styles.ervaAviso}>Drenando 10% dos creditos por segundo</span>
                                <button
                                    type="button"
                                    className={styles.botaoBanir}
                                    onClick={function () {
                                        baterNaErva(indice);
                                    }}
                                >
                                    BANIR ({faltam})
                                </button>
                            </div>
                        );
                    }

                    if(!lote.cultura){
                        const podePlantar = estoque >= cultura.custoAdubo;

                        return (
                            <button
                                key={lote.id}
                                type="button"
                                className={`${styles.lote} ${styles.loteVazio}`}
                                disabled={!podePlantar}
                                onClick={function () {
                                    plantar(indice, culturaEscolhida, usarBruto);
                                }}
                            >
                                <span className={styles.loteTitulo}>Lote {indice + 1}</span>
                                <span className={styles.loteIcone}>＋</span>
                                <span className={styles.loteEstado}>
                                    {podePlantar
                                        ? "Plantar " + cultura.nome
                                        : usarBruto
                                            ? "Falta adubo bruto"
                                            : fazenda.aduboBruto > 0
                                                ? "Refine o adubo (ou marque adubo bruto)"
                                                : "Sem adubo: volte para as fases"}
                                </span>
                            </button>
                        );
                    }

                    const plantada = buscaCultura(lote.cultura);
                    const necessario = plantada.tempo * bonus.multiplicadorCultivo;
                    const porcentagem = Math.min(100, (lote.progresso / necessario) * 100);
                    const turbinado = lote.turboAte > Date.now();
                    const valorVenda = Math.round(plantada.valor * bonus.multiplicadorVenda);

                    return (
                        <div
                            key={lote.id}
                            className={`${styles.lote} ${lote.pronto ? styles.lotePronto : ""}`}
                            style={{"--cultura-cor": plantada.cor}}
                        >
                            <span className={styles.loteTitulo}>Lote {indice + 1}</span>
                            <span className={styles.loteIcone}>{plantada.icone}</span>
                            <strong className={styles.loteNome}>{plantada.nome}</strong>

                            {lote.pronto ? (
                                <button
                                    type="button"
                                    className={styles.botaoColher}
                                    onClick={function () {
                                        colher(indice);
                                    }}
                                >
                                    Colher +{valorVenda} cr
                                </button>
                            ) : (
                                <>
                                    <span className={styles.progressoTrilho}>
                                        <span style={{width: porcentagem + "%"}} />
                                    </span>
                                    <span className={styles.loteEstado}>
                                        {turbinado ? "Turbinado 2x" : "Em crescimento"} · {Math.floor(porcentagem)}%
                                    </span>
                                    <button
                                        type="button"
                                        className={styles.botaoTurbo}
                                        disabled={turbinado || fazenda.aduboRefinado < CUSTO_FERTILIZANTE_TURBO}
                                        onClick={function () {
                                            turbinar(indice);
                                        }}
                                    >
                                        Fertilizante turbo ({CUSTO_FERTILIZANTE_TURBO})
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
