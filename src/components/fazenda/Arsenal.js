import {useState} from "react";
import Link from "next/link";
import {SUPER_PLANTAS, buscaPlanta} from "../../data/defesa";
import {custoUpJardim, bonusNivelJardim} from "../../data/fazenda";
import {useFazenda} from "../../contexts/fazendaContext";
import styles from "../../styles/components/Fazenda.module.css";

const RARIDADES = {
    comum: "Comum",
    rara: "Rara",
    epica: "Epica",
};

export default function Arsenal() {
    const {fazenda, bonus, plantaNoJardim, renomeiaJardim, upaJardim} = useFazenda();
    const [rascunho, setRascunho] = useState({});

    const disponiveis = SUPER_PLANTAS.filter(function (planta) {
        return (fazenda.superPlantas[planta.id] || 0) > 0;
    });
    const total = SUPER_PLANTAS.reduce(function (soma, planta) {
        return soma + (fazenda.superPlantas[planta.id] || 0);
    }, 0);

    function alteraRascunho(indice, campo, valor){
        setRascunho(function (atual) {
            return {...atual, [indice]: {...(atual[indice] || {}), [campo]: valor}};
        });
    }

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

            <div className={styles.vagasAviso}>
                <strong>Jardim de Super Plantas</strong>
                <span>
                    Seis vagas para as suas plantas pessoais. Plantar aqui gasta uma carta do deck, mas dali em diante
                    ela e permanente: entra em toda batalha, volta para o jardim no fim e ganha pontos para subir de nivel.
                </span>
            </div>

            <div className={styles.jardim}>
                {fazenda.jardim.map(function (item, indice) {
                    if(item){
                        const planta = buscaPlanta(item.plantaId);
                        const custo = custoUpJardim(item.nivel);
                        const podeUpar = item.pontos >= custo;
                        const forca = Math.round((bonusNivelJardim(item.nivel) - 1) * 100);

                        return (
                            <div key={indice} className={styles.vagaJardim}>
                                <div className={styles.upgradeTopo}>
                                    <span className={styles.upgradeIcone}>{planta ? planta.icone : "🌿"}</span>
                                    <div>
                                        <strong>{item.nome}</strong>
                                        <span className={styles.upgradeNivel}>
                                            {planta ? planta.nome : "Super Planta"} · Nv {item.nivel}
                                            {forca > 0 ? " (+" + forca + "%)" : ""}
                                        </span>
                                    </div>
                                </div>

                                <input
                                    className={styles.campoNome}
                                    type="text"
                                    defaultValue={item.nome}
                                    maxLength={18}
                                    onBlur={function (e) {
                                        renomeiaJardim(indice, e.target.value);
                                    }}
                                />

                                <span className={styles.blocoTexto}>
                                    {item.pontos} pontos · {item.batalhas} batalha(s)
                                </span>

                                <button
                                    type="button"
                                    className={styles.botaoComprar}
                                    disabled={!podeUpar}
                                    onClick={function () {
                                        upaJardim(indice);
                                    }}
                                >
                                    {podeUpar ? "Upar para Nv " + (item.nivel + 1) : "Upar (" + custo + " pts)"}
                                </button>
                            </div>
                        );
                    }

                    const escolha = rascunho[indice] || {};
                    const plantaId = escolha.plantaId || (disponiveis[0] && disponiveis[0].id) || "";

                    return (
                        <div key={indice} className={`${styles.vagaJardim} ${styles.vagaVazia}`}>
                            <span className={styles.upgradeIcone}>🪴</span>
                            <strong>Vaga {indice + 1}</strong>

                            {disponiveis.length === 0 ? (
                                <span className={styles.blocoTexto}>
                                    Sem cartas no deck. Colha mais para conseguir uma Super Planta.
                                </span>
                            ) : (
                                <>
                                    <select
                                        className={styles.campoNome}
                                        value={plantaId}
                                        onChange={function (e) {
                                            alteraRascunho(indice, "plantaId", e.target.value);
                                        }}
                                    >
                                        {disponiveis.map(function (planta) {
                                            return (
                                                <option key={planta.id} value={planta.id}>
                                                    {planta.icone} {planta.nome} (x{fazenda.superPlantas[planta.id]})
                                                </option>
                                            );
                                        })}
                                    </select>

                                    <input
                                        className={styles.campoNome}
                                        type="text"
                                        placeholder="Nome da sua planta"
                                        maxLength={18}
                                        value={escolha.nome || ""}
                                        onChange={function (e) {
                                            alteraRascunho(indice, "nome", e.target.value);
                                        }}
                                    />

                                    <button
                                        type="button"
                                        className={styles.botaoComprar}
                                        onClick={function () {
                                            plantaNoJardim(indice, plantaId, escolha.nome);
                                            alteraRascunho(indice, "nome", "");
                                        }}
                                    >
                                        Plantar no jardim
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
