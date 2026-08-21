This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Pilotos (selecao de personagem)

Cada partida comeca na tela "Escolha seu piloto". Os pilotos ficam em
`src/data/personagens.js` e cada um define:

- `foto`: arquivo em `public/images/personagens/<id>.png`
- `estiloNave`: variaveis CSS que desenham a nave (cores, bico, asas, raio)
- `atributos`: `velocidade`, `cadencia` (quanto menor, mais rapido atira), `vida`,
  `pontos`, `sortePowerUp` e `duracaoPowerUp`
- `barras`: valores de 0 a 100 so para as barrinhas do card

Pilotos atuais: Fred, Dudu, Gusta, Iann, Pupu e Ravel. Para trocar a foto de
alguem basta substituir o png correspondente em `public/images/personagens/`
mantendo o mesmo nome de arquivo (o `id` do piloto).

Atalhos: `WASD` move, `Espaco` atira, `R` reinicia, `T` volta para a selecao de piloto.

## Meta-game: Fazenda de Ganja Intergalactica

Depois de cada run do space shooter o jogo credita o resultado na fazenda
(`/fazenda`), que roda como um tycoon/idle:

- **Adubo Bruto**: cai dos Lorenzos abatidos (1 por abate + sacos de 3 que dao
  para coletar em voo). O Pupu rende +20% quando e ele quem joga a fase.
- **Estacao de Refino**: converte Bruto em Refinado. Plantar direto com bruto
  tem 15% de chance de nascer uma Erva Daninha Neoliberal, que trava o lote e
  drena 10% dos creditos por segundo ate ser banida no clique.
- **Plantacao**: 6 lotes, tres variedades (Beck Estelar, Purple Cosmica e OG
  Intergalactica) com tempo, custo e valor diferentes.
- **Tripulacao**: cada piloto tem um papel de fazenda e ganha XP de operacao
  jogando as fases; escalar ele aplica o bonus (ver `src/data/personagens.js`).
- **Upgrades**: refinador, tanque, lampadas UV, irrigacao, auto-harvester e
  alojamento (`src/data/fazenda.js`).

O progresso fica salvo no `localStorage` sob a chave `fazenda-intergalactica-v1`.

## Ganja vs Lorenzo (defesa)

Terceiro modo, em `/defesa`, rodando no mesmo motor das fases (`src/engine/motor.js`,
`useLoopDeJogo`, `useEntradaJogo`): mesma arena de 800x600, mesma colisao por
retangulo e os mesmos controles (WASD/espaco no PC, d-pad + A no celular).

- Planta-se no clique/toque (celula da horta) e a resina se pega no clique.
- O piloto escolhido fica de guarda **em cima da cerca**: `W`/`S` (ou o d-pad)
  sobem e descem ele, e o espaco (ou o A) da um tiro de cobertura na linha dele
  custando resina (`COMANDANTE` em `src/data/defesa.js`).
- **Mudas comuns** (Broto de Resina, Cuia-Canhao, Bong de Pedra) custam so resina,
  que os brotos soltam no chao e o vaso coleta encostando.
- **Deck de Super Plantas**: cartas que caem das colheitas da fazenda. Sao
  consumidas ao plantar.
- **Lorenzos** vem em ondas por fase. A faccao Cruzada Moral tem Fiscal da Moral,
  Vizinho Delator, Tia do Grupo da Familia (que carrega a Mamadeira e acelera a
  linha), Pastor de Esquina, Vigilancia Sanitaria (apreende plantas) e o Deputado
  da Bancada, que aprova PLs bloqueando colunas.
- O piloto escolhido vira **comandante** e aplica o bonus dele na batalha
  (`COMANDO` em `src/data/defesa.js`).
- Vitoria paga creditos, adubo e XP; derrota deixa uma Erva Daninha infestar um
  lote da fazenda.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
