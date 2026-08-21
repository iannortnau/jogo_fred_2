import {useState} from "react";
import Link from "next/link";
import Estufa from "./Estufa";
import Refinaria from "./Refinaria";
import Tripulacao from "./Tripulacao";
import Loja from "./Loja";
import Arsenal from "./Arsenal";
import {buscaPlanta} from "../../data/defesa";
import {useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Fazenda.module.css";

const ABAS = [
    {id: "estufa", nome: "Plantacao", icone: "🌿"},
    {id: "refino", nome: "Refino", icone: "⚗️"},
    {id: "tripulacao", nome: "Tripulacao", icone: "👨‍🚀"},
    {id: "arsenal", nome: "Arsenal", icone: "🌵"},
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
    const drop = fazenda.ultimoDrop && (Date.now() - fazenda.ultimoDrop.em) < 8000
        ? buscaPlanta(fazenda.ultimoDrop.id)
        : null;

    return (
        <div className={styles.fazenda}>
            <div className={styles.topo}>
                <div className={styles.tituloGrupo}>
                    <strong className={styles.titulo}>Fazenda de Ganja Intergalactica</strong>
                    <span className={styles.blocoTexto}>
                        {fazenda.totalLorenzos} Lorenzos abatidos ate agora
                    </span>
                </div>

                <div className={styles.topoBotoes}>
                    <Link href="/defesa">
                        <a className={styles.botaoDefender}>🌿 Defesa</a>
                    </Link>
                    <Link href="/">
                        <a className={styles.botaoVoltar}>🚀 Fases</a>
                    </Link>
                </div>
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

            {drop && (
                <div className={styles.avisoDrop}>
                    <span className={styles.avisoDropIcone}>{drop.icone}</span>
                    <div>
                        <strong>Super Planta na colheita!</strong>
                        <span className={styles.blocoTexto}>
                            {drop.nome} foi para o Arsenal.
                        </span>
                    </div>
                </div>
            )}

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
            {aba === "arsenal" && <Arsenal />}
            {aba === "loja" && <Loja />}
        </div>
    )
}
