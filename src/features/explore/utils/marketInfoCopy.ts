/**
 * Copy didático dos indicadores da tela /mercado. Centralizado para:
 *  - manter linguagem consistente
 *  - revisar edição não-técnica sem procurar em 10 componentes
 *  - cada explicação em 1-2 frases curtas, foco no que o número significa
 *    e em como o usuário deve interpretá-lo
 */

// ─── Ribbon / tickers globais ────────────────────────────────────────────────
export const RIBBON_INFO = {
  panorama:
    "Tickers globais (índices, câmbio, commodities e cripto) atualizados com o último fechamento. Carrossel rola automaticamente — pause passando o mouse.",
  marketStatus:
    "Estado da sessão da B3: Aberto (10h–17h BRT), Pré-abertura (9h–10h) ou Fechado fora desse horário e fim de semana.",
} as const;

export const TICKER_INFO: Record<string, string> = {
  "^BVSP":  "Ibovespa — índice de ações mais líquidas da B3, ponderado por valor de mercado ajustado por free float.",
  "^IBRX":  "IBrX 50 — 50 ações mais negociadas da B3, ponderadas por valor de mercado disponível para negociação.",
  "^SMLL":  "Small Caps — índice das ações de menor capitalização da B3. Tende a outperformar em ciclos de risk-on.",
  "^IFIX":  "IFIX — índice dos Fundos Imobiliários mais líquidos da B3. Proxy do desempenho do setor de FIIs.",
  "^IVBX2": "IVBX-2 — índice de ações B3 excluindo blue chips, foca empresas do 11º ao 60º mais negociadas.",
  "^GSPC":  "S&P 500 — 500 maiores empresas listadas nas bolsas dos EUA. Referência global de ações.",
  "^IXIC":  "Nasdaq Composite — índice amplo da bolsa Nasdaq, concentrado em tecnologia.",
  "^DJI":   "Dow Jones Industrial Average — 30 blue chips americanas ponderadas por preço.",
  "USDBRL": "Cotação PTAX do dólar comercial em reais, publicada diariamente pelo Banco Central.",
  "^VIX":   "Índice de volatilidade implícita do S&P 500 (CBOE) em 30 dias. Acima de 20 sinaliza mercado nervoso.",
  "BTC":    "Bitcoin em dólar — cotação spot da principal criptomoeda.",
  "BRENT":  "Petróleo Brent — referência global para precificação do óleo. US$ por barril.",
  "WTI":    "Petróleo WTI — referência norte-americana (West Texas Intermediate). US$ por barril.",
  "GOLD":   "Ouro spot em US$ por onça-troy (≈31g). Hedge clássico contra inflação e estresse geopolítico.",
  "IRONORE":"Minério de ferro 62% Fe (plataforma SGX). Relevante para Vale/CSN/Gerdau.",
  "DXY":    "Dollar Index — força do dólar contra uma cesta de 6 moedas (euro, iene, libra, dólar canadense, franco, coroa sueca).",
};

// ─── Hero e top-level ───────────────────────────────────────────────────────
export const TONE_INFO =
  "Tom composto do mercado — combina breadth (altas × baixas), nível de volatilidade e tendência dos índices-âncora. Bullish/Neutro/Bearish.";

export const TIME_RANGE_INFO =
  "Janela temporal aplicada aos gráficos da página. Cards com sparkline se ajustam ao período selecionado; indicadores mensais (macro BR) mantêm janela própria.";

// ─── Risk panel ──────────────────────────────────────────────────────────────
export const RISK_PANEL_INFO = {
  volatility:
    "Nível de volatilidade do mercado brasileiro (proxy B3). Baixa (<40) = estável; Moderada (40–70) = operacional; Alta (>70) = cautela.",
  breadth:
    "Proporção de ativos em alta vs baixa no pregão. Acima de 60% sinaliza amplitude positiva (mercado 'saudável'), abaixo de 40% é pressão generalizada.",
  fearGreed:
    "Fear & Greed Index — sentimento composto de mercado (0–100). Score baixo = medo (contrarian buy), alto = ganância (possível topo). Fonte: alternative.me.",
  vix:
    "VIX — volatilidade implícita de 30 dias do S&P 500. Conhecido como 'índice do medo' dos EUA. Acima de 20 indica nervosismo crescente.",
  dxy:
    "Dollar Index — força do dólar americano contra cesta de 6 moedas desenvolvidas. DXY em alta normalmente pressiona emergentes e commodities.",
  diCurve:
    "Curva de juros DI prefixada — yields esperados em diferentes prazos (3M a 10A). Forma Invertida/Achatada/Inclinada indica expectativas do mercado sobre juros futuros.",
} as const;

// ─── Sector heatmap ──────────────────────────────────────────────────────────
export const SECTOR_HEATMAP_INFO =
  "Variação média % do dia agrupada por setor B3. Intensidade da cor reflete magnitude da variação. Cobre só os papéis presentes nos movers do dia.";

// ─── Macro BR ────────────────────────────────────────────────────────────────
export const MACRO_BR_INFO: Record<string, string> = {
  SELIC:
    "Taxa básica de juros da economia brasileira, definida pelo Copom a cada 45 dias. É o benchmark para renda fixa e ancoragem de expectativas.",
  IPCA:
    "Índice de Preços ao Consumidor Amplo — inflação oficial do Brasil (IBGE). Meta do Banco Central: 3% ao ano com tolerância de ±1,5pp.",
  IBC_BR:
    "Índice de Atividade Econômica do Banco Central — proxy mensal do PIB, antecipa o comportamento do Produto Interno Bruto.",
};

export const ECONOMIC_CYCLE_INFO =
  "Fase atual do ciclo econômico brasileiro segundo o Merrill Lynch Investment Clock, cruzando crescimento (IBC-Br YoY × tendência) com inflação (IPCA 12m × trimestre anterior).";

// ─── Macro global (commodities + crypto) ────────────────────────────────────
export const GLOBAL_MACRO_INFO: Record<string, string> = {
  brent:   TICKER_INFO["BRENT"],
  wti:     TICKER_INFO["WTI"],
  gold:    TICKER_INFO["GOLD"],
  ironOre: TICKER_INFO["IRONORE"],
  bitcoin: TICKER_INFO["BTC"],
};

// ─── Comparisons ─────────────────────────────────────────────────────────────
export const COMPARISON_INFO: Record<string, string> = {
  ibov_usd:
    "Performance do Ibov convertida em dólares — mostra o retorno do investidor global em Brasil, isolando efeito cambial.",
  ibov_real:
    "Ibov descontado pelo IPCA acumulado em 12 meses — revela o retorno REAL (ajustado pela inflação) para o investidor doméstico.",
  gold_brl:
    "Preço da onça-troy de ouro convertido em reais (GOLD × USDBRL). Útil para hedge local contra desvalorização do real.",
  smll_vs_ibov:
    "Razão do Índice Small Caps pelo Ibovespa. Alta = investidores aceitam mais risco (risk-on); queda = fuga pra large caps (risk-off).",
  ibov_vs_spx_ytd:
    "Diferença entre a performance YTD do Ibovespa e do S&P 500. Positivo = Brasil liderando; negativo = EUA performando melhor.",
};
