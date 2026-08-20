import {UPGRADES, custoUpgrade} from "../../data/fazenda";
import {useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Fazenda.module.css";

export default function Loja() {
    const {fazenda, comprarUpgrade} = useFazenda();

    return (
        <div className={styles.painel}>
            <div className={styles.upgrades}>
                {UPGRADES.map(function (upgrade) {
                    const nivel = fazenda.upgrades[upgrade.id] || 0;
                    const noMaximo = nivel >= upgrade.max;
                    const preco = custoUpgrade(upgrade, nivel);
                    const podeComprar = !noMaximo && fazenda.creditos >= preco;

                    return (
                        <div key={upgrade.id} className={styles.cardUpgrade}>
                            <div className={styles.upgradeTopo}>
                                <span className={styles.upgradeIcone}>{upgrade.icone}</span>
                                <div>
                                    <strong>{upgrade.nome}</strong>
                                    <span className={styles.upgradeNivel}>
                                        Nivel {nivel}/{upgrade.max}
                                    </span>
                                </div>
                            </div>

                            <span className={styles.blocoTexto}>{upgrade.descricao}</span>

                            <button
                                type="button"
                                className={styles.botaoComprar}
                                disabled={!podeComprar}
                                onClick={function () {
                                    comprarUpgrade(upgrade.id);
                                }}
                            >
                                {noMaximo ? "No maximo" : "Comprar por " + preco + " cr"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
