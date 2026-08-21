import Link from "next/link";
import {SUPER_PLANTAS} from "../../data/defesa";
import {useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Fazenda.module.css";

const RARIDADES = {
    comum: "Comum",
    rara: "Rara",
    epica: "Epica",
};

export default function Arsenal() {
    const {fazenda, bonus} = useFazenda();
    const total = SUPER_PLANTAS.reduce(function (soma, planta) {
        return soma + (fazenda.superPlantas[planta.id] || 0);
    }, 0);

    return (
        <div className={styles.painel}>
            <div className={styles.vagasAviso}>
                <strong>Deck de Super Plantas</strong>
                <span>
                    Caem das colheitas ({Math.round(bonus.chanceSuperPlanta * 100)}% de chance, dobrada na OG
                    Intergalactica). As cartas do deck somem quando voce planta na batalha. Voce tem {total} carta(s).
                </span>
                <Link href="/defesa">
                    <a className={styles.botaoDefender}>🌿 Defender a fazenda</a>
                </Link>
            </div>

            <div className={styles.upgrades}>
                {SUPER_PLANTAS.map(function (planta) {
                    const estoque = fazenda.superPlantas[planta.id] || 0;

                    return (
                        <div
                            key={planta.id}
                            className={`${styles.cardUpgrade} ${estoque > 0 ? "" : styles.cardVazio}`}
                        >
                            <div className={styles.upgradeTopo}>
                                <span className={styles.upgradeIcone}>{planta.icone}</span>
                                <div>
                                    <strong>{planta.nome}</strong>
                                    <span className={styles.upgradeNivel}>
                                        {RARIDADES[planta.raridade]} · {estoque > 0 ? "x" + estoque : "sem estoque"}
                                    </span>
                                </div>
                            </div>

                            <span className={styles.blocoTexto}>{planta.descricao}</span>

                            <span className={styles.custoCarta}>
                                1 carta{planta.custoResina > 0 ? " + " + planta.custoResina + " resina" : ""}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
