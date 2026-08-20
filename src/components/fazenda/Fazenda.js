import {useState} from "react";
import Link from "next/link";
import Estufa from "./Estufa";
import Refinaria from "./Refinaria";
import Tripulacao from "./Tripulacao";
import Loja from "./Loja";
import {useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Fazenda.module.css";

const ABAS = [
    {id: "estufa", nome: "Plantacao", icone: "🌿"},
    {id: "refino", nome: "Refino", icone: "⚗️"},
    {id: "tripulacao", nome: "Tripulacao", icone: "👨‍🚀"},
    {id: "loja", nome: "Upgrades", icone: "🛒"},
];

export default function Fazenda() {
    const [aba, setAba] = useState("estufa");
    const {fazenda, bonus, carregada} = useFazenda();

    if(!carregada){
        return (
            <div className={styles.fazenda}>
                <span className={styles.blocoTexto}>Carregando a fazenda...</span>
            </div>
        )
    }

    const lotesInfectados = fazenda.lotes.filter(function (lote) {
        return Boolean(lote.praga);
    }).length;

    return (
        <div className={styles.fazenda}>
            <div className={styles.topo}>
                <div className={styles.tituloGrupo}>
                    <strong className={styles.titulo}>Fazenda de Ganja Intergalactica</strong>
                    <span className={styles.blocoTexto}>
                        {fazenda.totalLorenzos} Lorenzos abatidos ate agora
                    </span>
                </div>

                <Link href="/">
                    <a className={styles.botaoVoltar}>🚀 Ir para as fases</a>
                </Link>
            </div>

            <div className={styles.recursos}>
                <div className={styles.recurso}>
                    <span className={styles.recursoIcone}>💩</span>
                    <div>
                        <strong>{fazenda.aduboBruto}<small>/{bonus.capacidadeAdubo}</small></strong>
                        <span>Adubo Bruto</span>
                    </div>
                </div>
                <div className={styles.recurso}>
                    <span className={styles.recursoIcone}>🧪</span>
                    <div>
                        <strong>{fazenda.aduboRefinado}</strong>
                        <span>Adubo Refinado</span>
                    </div>
                </div>
                <div className={styles.recurso}>
                    <span className={styles.recursoIcone}>🪙</span>
                    <div>
                        <strong>{Math.floor(fazenda.creditos)}</strong>
                        <span>Creditos Galacticos</span>
                    </div>
                </div>
            </div>

            {lotesInfectados > 0 && (
                <div className={styles.alertaErva}>
                    ⚠️ {lotesInfectados} lote(s) infestado(s) drenando creditos. Bane a praga na aba Plantacao.
                </div>
            )}

            <div className={styles.abas}>
                {ABAS.map(function (item) {
                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`${styles.aba} ${aba === item.id ? styles.abaAtiva : ""}`}
                            onClick={function () {
                                setAba(item.id);
                            }}
                        >
                            <span>{item.icone}</span>
                            {item.nome}
                        </button>
                    );
                })}
            </div>

            {aba === "estufa" && <Estufa />}
            {aba === "refino" && <Refinaria />}
            {aba === "tripulacao" && <Tripulacao />}
            {aba === "loja" && <Loja />}
        </div>
    )
}
