// Ganja vs Lorenzo: dados da defesa. Mesma arena das fases (800x600),
// tempos em ms e velocidades em pixels por ms.
export const GRADE = {
    linhas: 5,
    colunas: 8,
    largura: 82,
    altura: 92,
    inicioX: 100,
    inicioY: 78,
};

export const TAMANHOS = {
    comandante: {largura: 56, altura: 68},
    planta: {largura: 62, altura: 74},
    lorenzo: {largura: 46, altura: 62},
    projetil: {largura: 22, altura: 10},
    resina: {largura: 34, altura: 34},
    mamadeira: {largura: 34, altura: 44},
};

// O comandante fica em cima da cerca, sobe e desce e da cobertura de fogo.
export const COMANDANTE = {
    x: 22,
    velocidade: 0.3,
    dano: 35,
    cooldown: 380,
    custoResina: 10,
    velocidadeProjetil: 0.5,
};
export const VIDA_CERCA = 100;
export const DANO_INVASAO = 25;
export const VALIDADE_RESINA = 12000;
export const RESINA_POR_GOTA = 25;
export const INTERVALO_CHUVA_RESINA = 9000;

export const MAMADEIRA = {
    vida: 150,
    buffVelocidade: 0.4,
    furia: 1.3,
    recompensaResina: 50,
};

export const MUDAS = [
    {
        id: "broto",
        nome: "Broto de Resina",
        icone: "🌱",
        tipo: "comum",
        comportamento: "gerador",
        descricao: "Solta 25 de resina a cada 8s.",
        custoResina: 50,
        custoCarta: 0,
        recarga: 5000,
        vida: 220,
        intervalo: 8000,
    },
    {
        id: "canhao",
        nome: "Cuia-Canhao",
        icone: "💣",
        tipo: "comum",
        comportamento: "atirador",
        descricao: "Atira reto na linha: 20 de dano a cada 1,4s.",
        custoResina: 100,
        custoCarta: 0,
        recarga: 4000,
        vida: 300,
        cadencia: 1400,
        dano: 20,
        velocidadeProjetil: 0.36,
    },
    {
        id: "muro",
        nome: "Bong de Pedra",
        icone: "🪵",
        tipo: "comum",
        comportamento: "parede",
        descricao: "900 de vida. Segura a fila e nao atira.",
        custoResina: 50,
        custoCarta: 0,
        recarga: 12000,
        vida: 900,
    },
];

export const SUPER_PLANTAS = [
    {
        id: "skunk",
        nome: "Skunk Explosiva",
        icone: "🌵",
        tipo: "super",
        comportamento: "bomba",
        descricao: "Explode na hora: 900 de dano em 3x3.",
        custoResina: 0,
        custoCarta: 1,
        recarga: 8000,
        dano: 900,
        peso: 34,
        raridade: "comum",
    },
    {
        id: "haze",
        nome: "Purple Haze",
        icone: "🟣",
        tipo: "super",
        comportamento: "atirador",
        descricao: "Atira e deixa o Lorenzo lento por 3s.",
        custoResina: 75,
        custoCarta: 1,
        recarga: 6000,
        vida: 300,
        cadencia: 1500,
        dano: 20,
        velocidadeProjetil: 0.34,
        lentidao: {fator: 0.55, duracao: 3000},
        peso: 26,
        raridade: "comum",
    },
    {
        id: "fumaca",
        nome: "Fumaca Densa",
        icone: "💨",
        tipo: "super",
        comportamento: "cone",
        descricao: "Dano em cone atravessando 4 colunas.",
        custoResina: 75,
        custoCarta: 1,
        recarga: 6000,
        vida: 300,
        cadencia: 900,
        dano: 12,
        alcanceColunas: 4,
        peso: 20,
        raridade: "rara",
    },
    {
        id: "trichoma",
        nome: "Trichoma Triplo",
        icone: "🍁",
        tipo: "super",
        comportamento: "triplo",
        descricao: "Atira na linha e nas duas vizinhas.",
        custoResina: 100,
        custoCarta: 1,
        recarga: 7000,
        vida: 300,
        cadencia: 1500,
        dano: 20,
        velocidadeProjetil: 0.36,
        peso: 12,
        raridade: "rara",
    },
    {
        id: "checagem",
        nome: "Checagem de Fatos",
        icone: "📰",
        tipo: "super",
        comportamento: "checagem",
        descricao: "Destroi todas as Mamadeiras e imuniza a linha por 20s.",
        custoResina: 25,
        custoCarta: 1,
        recarga: 5000,
        vida: 250,
        imunidade: 20000,
        peso: 5,
        raridade: "epica",
    },
    {
        id: "alvara",
        nome: "Alvara Carimbado",
        icone: "🕊️",
        tipo: "super",
        comportamento: "alvara",
        descricao: "Anula PLs e apreensoes por 15s.",
        custoResina: 0,
        custoCarta: 1,
        recarga: 10000,
        protecao: 15000,
        peso: 3,
        raridade: "epica",
    },
];

export const PLANTAS = [...MUDAS, ...SUPER_PLANTAS];

export function buscaPlanta(id){
    return PLANTAS.find(function (planta) {
        return planta.id === id;
    });
}

export const LORENZOS = [
    {
        id: "comum",
        nome: "Lorenzo",
        vida: 150,
        velocidade: 0.018,
        dano: 40,
        faccao: "rua",
    },
    {
        id: "capacete",
        nome: "Lorenzo de Capacete",
        vida: 400,
        velocidade: 0.016,
        dano: 45,
        faccao: "rua",
        adereco: "🪖",
    },
    {
        id: "corredor",
        nome: "Lorenzo Corredor",
        vida: 130,
        velocidade: 0.038,
        dano: 40,
        faccao: "rua",
        adereco: "👟",
    },
    {
        id: "balde",
        nome: "Lorenzo do Balde",
        vida: 800,
        velocidade: 0.013,
        dano: 50,
        faccao: "rua",
        adereco: "🪣",
    },
    {
        id: "fiscal",
        nome: "Fiscal da Moral",
        vida: 260,
        velocidade: 0.018,
        dano: 40,
        faccao: "moral",
        adereco: "📋",
        multa: 25,
    },
    {
        id: "delator",
        nome: "Vizinho Delator",
        vida: 200,
        velocidade: 0.02,
        dano: 40,
        faccao: "moral",
        adereco: "🪟",
        denuncia: true,
    },
    {
        id: "tia",
        nome: "Tia do Grupo da Familia",
        vida: 240,
        velocidade: 0.017,
        dano: 40,
        faccao: "moral",
        adereco: "📱",
        carregaMamadeira: true,
    },
    {
        id: "pastor",
        nome: "Pastor de Esquina",
        vida: 380,
        velocidade: 0.016,
        dano: 40,
        faccao: "moral",
        adereco: "⛪",
        aura: {alcance: 140, bonusVelocidade: 0.3},
    },
    {
        id: "vigilancia",
        nome: "Vigilancia Sanitaria",
        vida: 560,
        velocidade: 0.015,
        dano: 40,
        faccao: "moral",
        adereco: "🚨",
        apreende: true,
    },
    {
        id: "deputado",
        nome: "Deputado da Bancada",
        vida: 2000,
        velocidade: 0.012,
        dano: 60,
        faccao: "moral",
        adereco: "🏛️",
        chefe: true,
        pl: {intervalo: 12000, duracao: 8000},
    },
];

export function buscaLorenzo(id){
    return LORENZOS.find(function (lorenzo) {
        return lorenzo.id === id;
    }) || LORENZOS[0];
}

export const FASES = [
    {
        id: 1,
        nome: "Quintal dos Fundos",
        descricao: "Uns Lorenzos curiosos farejando a plantacao.",
        resinaInicial: 125,
        ondas: [
            {atraso: 8000, itens: [{tipo: "comum", quantidade: 2}]},
            {atraso: 22000, itens: [{tipo: "comum", quantidade: 3}]},
            {atraso: 20000, itens: [{tipo: "comum", quantidade: 4}, {tipo: "corredor", quantidade: 1}]},
        ],
    },
    {
        id: 2,
        nome: "Cerca de Tras",
        descricao: "Chegaram os apressadinhos.",
        resinaInicial: 125,
        ondas: [
            {atraso: 7000, itens: [{tipo: "comum", quantidade: 3}]},
            {atraso: 20000, itens: [{tipo: "corredor", quantidade: 3}]},
            {atraso: 20000, itens: [{tipo: "comum", quantidade: 4}, {tipo: "capacete", quantidade: 1}]},
            {atraso: 22000, itens: [{tipo: "capacete", quantidade: 2}, {tipo: "corredor", quantidade: 2}]},
        ],
    },
    {
        id: 3,
        nome: "Rua de Baixo",
        descricao: "Agora vem gente de capacete e balde.",
        resinaInicial: 100,
        ondas: [
            {atraso: 7000, itens: [{tipo: "comum", quantidade: 4}]},
            {atraso: 18000, itens: [{tipo: "capacete", quantidade: 3}]},
            {atraso: 20000, itens: [{tipo: "corredor", quantidade: 4}, {tipo: "comum", quantidade: 2}]},
            {atraso: 20000, itens: [{tipo: "balde", quantidade: 2}]},
            {atraso: 24000, itens: [{tipo: "balde", quantidade: 2}, {tipo: "capacete", quantidade: 3}]},
        ],
    },
    {
        id: 4,
        nome: "Cruzada Moral",
        descricao: "A vizinhanca se organizou contra a sua horta.",
        resinaInicial: 100,
        ondas: [
            {atraso: 7000, itens: [{tipo: "fiscal", quantidade: 2}]},
            {atraso: 18000, itens: [{tipo: "delator", quantidade: 2}, {tipo: "comum", quantidade: 2}]},
            {atraso: 20000, itens: [{tipo: "tia", quantidade: 2}]},
            {atraso: 20000, itens: [{tipo: "pastor", quantidade: 1}, {tipo: "capacete", quantidade: 3}]},
            {atraso: 24000, itens: [{tipo: "tia", quantidade: 2}, {tipo: "fiscal", quantidade: 2}, {tipo: "balde", quantidade: 1}]},
        ],
    },
    {
        id: 5,
        nome: "Comicio da Mamadeira",
        descricao: "O Deputado trouxe a bancada inteira e as provas.",
        resinaInicial: 100,
        ondas: [
            {atraso: 6000, itens: [{tipo: "fiscal", quantidade: 3}]},
            {atraso: 16000, itens: [{tipo: "tia", quantidade: 3}]},
            {atraso: 18000, itens: [{tipo: "vigilancia", quantidade: 2}, {tipo: "delator", quantidade: 2}]},
            {atraso: 20000, itens: [{tipo: "pastor", quantidade: 2}, {tipo: "balde", quantidade: 2}]},
            {atraso: 22000, itens: [{tipo: "tia", quantidade: 3}, {tipo: "corredor", quantidade: 4}]},
            {atraso: 26000, itens: [{tipo: "deputado", quantidade: 1}, {tipo: "vigilancia", quantidade: 2}, {tipo: "capacete", quantidade: 3}]},
        ],
    },
];

export function buscaFase(id){
    return FASES.find(function (fase) {
        return fase.id === id;
    }) || FASES[0];
}

export function recompensaDaFase(fase, repetindo){
    const escala = repetindo ? 0.4 : 1;

    return {
        creditos: Math.round(120 * fase.id * escala),
        adubo: Math.round(8 * fase.id * escala),
        xp: Math.round(40 * fase.id * escala),
    };
}

// Bonus do piloto escolhido como comandante da defesa.
export const COMANDO = {
    tempoCultivo: {rotulo: "Recarga das cartas -15%", recarga: 0.85},
    valorVenda: {rotulo: "Recompensa da fase +15%", recompensa: 1.15},
    semErva: {rotulo: "Plantas com +25% de vida", vida: 1.25},
    taxaRefino: {rotulo: "Cadencia de tiro +15%", cadencia: 0.85},
    dropAdubo: {rotulo: "Brotos geram +20% de resina", resina: 1.2},
    duracaoFertilizante: {rotulo: "Efeitos duram +50%", efeitos: 1.5},
};

export function comandoDoPiloto(personagem){
    const efeito = personagem && personagem.fazenda ? personagem.fazenda.efeito : null;

    return COMANDO[efeito] || {rotulo: "Sem bonus"};
}

export const CHANCE_SUPER_PLANTA = 0.15;
export const BONUS_SUPER_PLANTA_LENTA = 2;
