// Regras e numeros do meta-game da Fazenda Intergalactica.
export const CHAVE_SAVE = "fazenda-intergalactica-v1";

export const TICK = 200;
export const TEMPO_REFINO_BASE = 2600;
export const RISCO_ERVA_BASE = 0.15;
export const DRENO_ERVA_POR_SEGUNDO = 0.1;
export const CLIQUES_PARA_BANIR = 8;
export const TOTAL_LOTES = 18;
export const LOTES_INICIAIS = 9;
export const LOTES_POR_EXPANSAO = 3;
export const VAGAS_TRIPULACAO_BASE = 2;
export const CUSTO_FERTILIZANTE_TURBO = 3;
export const DURACAO_FERTILIZANTE_TURBO = 20000;
export const ADUBO_POR_LORENZO = 1;
export const ADUBO_POR_SACO = 3;
export const CHANCE_SACO_ADUBO = 0.22;

export const CULTURAS = [
    {
        id: "beck",
        nome: "Beck Estelar",
        icone: "🌱",
        custoAdubo: 1,
        tempo: 12000,
        valor: 14,
        cor: "#7ed957",
    },
    {
        id: "purple",
        nome: "Purple Cosmica",
        icone: "🌿",
        custoAdubo: 2,
        tempo: 35000,
        valor: 52,
        cor: "#c084fc",
    },
    {
        id: "og",
        nome: "OG Intergalactica",
        icone: "🍁",
        custoAdubo: 4,
        tempo: 90000,
        valor: 165,
        cor: "#facc15",
    },
];

export const UPGRADES = [
    {
        id: "refinador",
        nome: "Refinador Turbo",
        descricao: "Refina mais rapido. No nivel 2 zera a chance de falha de pureza.",
        icone: "⚗️",
        max: 5,
        custoBase: 120,
        custoFator: 1.85,
    },
    {
        id: "tanque",
        nome: "Tanque de Adubo",
        descricao: "+60 de capacidade de Adubo Bruto trazido das fases.",
        icone: "🛢️",
        max: 6,
        custoBase: 90,
        custoFator: 1.7,
    },
    {
        id: "uv",
        nome: "Lampadas UV",
        descricao: "-8% no tempo de crescimento de cada lote.",
        icone: "💡",
        max: 6,
        custoBase: 140,
        custoFator: 1.75,
    },
    {
        id: "irrigacao",
        nome: "Irrigacao Ionica",
        descricao: "+10% no valor de venda das colheitas.",
        icone: "💧",
        max: 6,
        custoBase: 160,
        custoFator: 1.8,
    },
    {
        id: "autoColheita",
        nome: "Auto-Harvester",
        descricao: "Colhe sozinho os lotes que ficam prontos.",
        icone: "🤖",
        max: 1,
        custoBase: 600,
        custoFator: 2,
    },
    {
        id: "estufaEspecial",
        nome: "Estufa Especial",
        descricao: "+5% de chance de Super Planta em cada colheita.",
        icone: "🧬",
        max: 4,
        custoBase: 300,
        custoFator: 2.2,
    },
    {
        id: "terreno",
        nome: "Expansao de Terreno",
        descricao: "Abre +3 lotes de plantio na estufa.",
        icone: "🚜",
        max: 3,
        custoBase: 260,
        custoFator: 2.15,
    },
    {
        id: "alojamento",
        nome: "Alojamento da Tripulacao",
        descricao: "+1 vaga para escalar pilotos na fazenda.",
        icone: "🛏️",
        max: 4,
        custoBase: 220,
        custoFator: 2.1,
    },
];

export const CAPACIDADE_TANQUE_BASE = 60;
export const CAPACIDADE_POR_NIVEL = 60;

export function custoUpgrade(upgrade, nivel){
    return Math.round(upgrade.custoBase * Math.pow(upgrade.custoFator, nivel));
}

export function xpParaProximoNivel(nivel){
    return Math.round(80 * Math.pow(nivel, 1.35));
}

export function nivelDoPiloto(xp){
    let nivel = 1;
    let restante = xp;

    while(restante >= xpParaProximoNivel(nivel) && nivel < 50){
        restante -= xpParaProximoNivel(nivel);
        nivel++;
    }

    return {nivel, xpNoNivel: restante, xpDoNivel: xpParaProximoNivel(nivel)};
}

// Um piloto de nivel alto entrega mais do que o bonus base.
export function forcaDoBonus(valorBase, nivel){
    return valorBase * (1 + ((nivel - 1) * 0.08));
}

export function xpDaRun(lorenzos, pontos){
    return Math.round((lorenzos * 6) + (pontos / 12));
}

// --- Jardim de Super Plantas: ate 6 plantas pessoais, nomeadas e permanentes.
export const TOTAL_JARDIM = 6;

export function custoUpJardim(nivel){
    return 50 * nivel;
}

export function bonusNivelJardim(nivel){
    return 1 + ((nivel - 1) * 0.12);
}

export function pontosDaBatalha(faseId, venceu){
    const base = 6 + (3 * faseId);

    return venceu ? base : Math.round(base / 2);
}
