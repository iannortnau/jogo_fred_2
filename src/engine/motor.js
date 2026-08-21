// Motor compartilhado pelas fases de nave e pela defesa Ganja vs Lorenzo.
// Coordenadas sempre em pixels da arena (800x600), tempo sempre em ms.
export function retangulosColidem(a, b){
    return (
        a.x < b.x + b.largura &&
        a.x + a.largura > b.x &&
        a.y < b.y + b.altura &&
        a.y + a.altura > b.y
    );
}

export function caixa(entidade, largura, altura){
    return {x: entidade.x, y: entidade.y, largura, altura};
}

export function limita(valor, minimo, maximo){
    return Math.min(Math.max(valor, minimo), maximo);
}

export function distancia(a, b){
    return Math.abs(a.x - b.x);
}

// Sorteia um item de [{peso}] respeitando o peso de cada um.
export function sorteiaComPeso(itens){
    const total = itens.reduce(function (soma, item) {
        return soma + item.peso;
    }, 0);

    if(total <= 0){
        return null;
    }

    let ponto = Math.random() * total;

    for(let indice = 0; indice < itens.length; indice++){
        ponto -= itens[indice].peso;

        if(ponto <= 0){
            return itens[indice];
        }
    }

    return itens[itens.length - 1];
}
