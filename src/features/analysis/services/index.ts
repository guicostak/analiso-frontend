/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    RELATÓRIO DE REQUISITOS DE BACKEND                       ║
 * ║              Modelo de Análise estilo SimplyWall.St (30 checks)            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ VISÃO GERAL                                                                │
 * │                                                                            │
 * │ O backend precisa implementar um motor de análise com 5 dimensões,         │
 * │ cada uma contendo 6 checks binários (pass/fail). Totalizando 30 checks.   │
 * │ O resultado alimenta um gráfico "Snowflake" de 5 eixos (0-6 cada).       │
 * │                                                                            │
 * │ Endpoint principal: GET /api/analysis/{ticker}                             │
 * │ Retorna: AnalysisData (vide interfaces/index.ts)                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ 1. DIMENSÃO: VALUE (Valuation) — 6 checks                                 │
 * │                                                                            │
 * │ Dados necessários do backend:                                              │
 * │  - DCF (Discounted Cash Flow):                                             │
 * │    • Projeções de FCF alavancado (1-10 anos) — fonte: consensus analysts  │
 * │    • Taxa de desconto (WACC): risk-free rate + beta × ERP                 │
 * │    • Risk-free rate: média 5 anos do bond 10Y do país                     │
 * │    • Beta: beta desalavancado da indústria, re-alavancado p/ empresa      │
 * │    • ERP: Equity Risk Premium trimestral (fonte: Damodaran)               │
 * │    • Terminal value via Gordon Growth Model                                │
 * │    • Shares outstanding para cálculo do valor por ação                    │
 * │                                                                            │
 * │  - Múltiplos relativos:                                                    │
 * │    • P/L (PE ratio) = Preço / LPA                                         │
 * │    • P/L médio do mercado e da indústria                                  │
 * │    • PEG = P/L / taxa crescimento LPA                                     │
 * │    • P/VP (PB ratio) = Preço / VPA                                        │
 * │    • P/VP médio da indústria                                              │
 * │                                                                            │
 * │  Checks:                                                                   │
 * │  #1 Preço ≥20% abaixo do DCF fair value                                  │
 * │  #2 Preço ≥40% abaixo do DCF fair value                                  │
 * │  #3 P/L < P/L médio do mercado (e >0)                                    │
 * │  #4 P/L < P/L médio da indústria (e >0)                                  │
 * │  #5 PEG entre 0 e 1                                                       │
 * │  #6 P/VP > 0 e < P/VP médio da indústria                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ 2. DIMENSÃO: FUTURE GROWTH — 6 checks                                     │
 * │                                                                            │
 * │ Dados necessários:                                                         │
 * │  - Projeções de consensus analysts (3-5 anos):                            │
 * │    • Crescimento de lucro anual                                           │
 * │    • Crescimento de receita anual                                         │
 * │    • ROE estimado em 3 anos                                               │
 * │  - Benchmarks:                                                             │
 * │    • Taxa de poupança sem risco + inflação (CPI)                          │
 * │    • Crescimento médio ponderado do mercado (lucro e receita)             │
 * │                                                                            │
 * │  Checks:                                                                   │
 * │  #1 Cresc. lucro > (taxa sem risco + inflação) OU lucrativa em 5 anos    │
 * │  #2 Cresc. lucro > média do mercado                                       │
 * │  #3 Cresc. receita > média do mercado                                     │
 * │  #4 Cresc. lucro > 20% ao ano                                            │
 * │  #5 Cresc. receita > 20% ao ano                                          │
 * │  #6 ROE estimado em 3 anos > 20%                                         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ 3. DIMENSÃO: PAST PERFORMANCE — 6 checks                                  │
 * │                                                                            │
 * │ Dados necessários:                                                         │
 * │  - Série histórica (5 anos, trimestral LTM):                             │
 * │    • LPA (EPS) GAAP                                                       │
 * │    • ROE, ROCE, ROA                                                       │
 * │  - Benchmarks:                                                             │
 * │    • Crescimento LPA médio da indústria                                   │
 * │    • ROA médio da indústria                                               │
 * │                                                                            │
 * │  Fórmulas:                                                                │
 * │    ROE = Lucro Líquido / PL médio                                         │
 * │    ROCE = EBIT / (Ativo Total - Passivo Circulante)                       │
 * │    ROA = Lucro Líquido / Ativo Total                                      │
 * │                                                                            │
 * │  Checks:                                                                   │
 * │  #1 Cresc. LPA último ano > média da indústria                            │
 * │  #2 LPA atual > LPA de 5 anos atrás                                      │
 * │  #3 Cresc. LPA último ano > média 5 anos (acelerando)                    │
 * │  #4 ROE atual > 20%                                                       │
 * │  #5 ROCE atual > ROCE de 3 anos atrás (melhorando)                       │
 * │  #6 ROA atual > ROA médio da indústria                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ 4. DIMENSÃO: FINANCIAL HEALTH — 6 checks                                  │
 * │                                                                            │
 * │ Dados necessários:                                                         │
 * │  - Balanço patrimonial:                                                    │
 * │    • Ativo circulante e não circulante                                    │
 * │    • Passivo circulante e não circulante                                  │
 * │    • Dívida total (série 5 anos)                                          │
 * │    • Patrimônio líquido                                                   │
 * │    • Fluxo de caixa operacional                                           │
 * │    • EBIT e despesa com juros                                             │
 * │                                                                            │
 * │  Checks (empresas não-financeiras):                                       │
 * │  #1 Ativo circulante > Passivo circulante                                 │
 * │  #2 Ativo circulante > Passivo não circulante                             │
 * │  #3 D/E não aumentou nos últimos 5 anos                                   │
 * │  #4 D/E < 40%                                                             │
 * │  #5 FCO > 20% da dívida total (cobertura de dívida)                      │
 * │  #6 EBIT > 5× despesa com juros (cobertura de juros)                     │
 * │                                                                            │
 * │  Checks alternativos (bancos/seguradoras):                                │
 * │  #1 Alavancagem < 20x                                                     │
 * │  #2 Provisão p/ perdas > baixas reais                                     │
 * │  #3 Depósitos > 50% do passivo total                                      │
 * │  #4 Empréstimos líquidos < 110% dos ativos totais                         │
 * │  #5 Empréstimos totais < 125% dos depósitos                               │
 * │  #6 Baixas líquidas < 3% dos empréstimos totais                           │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ 5. DIMENSÃO: DIVIDENDS — 6 checks                                         │
 * │                                                                            │
 * │ Dados necessários:                                                         │
 * │  - Dividend yield atual e histórico (10 anos)                              │
 * │  - DPA (dividendo por ação) — série 10 anos                              │
 * │  - LPA para cálculo do payout ratio                                       │
 * │  - Estimativas de DPA e LPA em 3 anos (consensus)                        │
 * │  - Percentis 25 e 75 do dividend yield do mercado                         │
 * │                                                                            │
 * │  Checks:                                                                   │
 * │  #1 Yield > percentil 25 do mercado                                       │
 * │  #2 Yield > percentil 75 do mercado (alto yield)                          │
 * │  #3 Sem queda >10% em nenhum dos últimos 10 anos (estabilidade)          │
 * │  #4 DPA atual > DPA de 10 anos atrás (crescimento)                       │
 * │  #5 Payout ratio entre 0-90% (sustentável)                               │
 * │  #6 Payout ratio estimado em 3 anos entre 0-90% (sustentável futuro)     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ FONTES DE DADOS NECESSÁRIAS                                                │
 * │                                                                            │
 * │  1. Demonstrações financeiras (CVM/SEC): balanço, DRE, DFC               │
 * │  2. Cotações históricas: B3/Yahoo Finance/Bloomberg                       │
 * │  3. Estimativas de analistas (consensus): Refinitiv/FactSet/Bloomberg     │
 * │  4. Dados de mercado: beta, risk-free rate, ERP                           │
 * │  5. Médias de indústria: calculadas semanalmente por região               │
 * │  6. Dados de insiders: CVM/SEC Form 4                                     │
 * │  7. Dados de ownership: BDI/Bloomberg                                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ ENDPOINTS SUGERIDOS                                                        │
 * │                                                                            │
 * │  GET /api/analysis/{ticker}          → AnalysisData completo              │
 * │  GET /api/analysis/{ticker}/value    → DCFValuation + RelativeValuation   │
 * │  GET /api/analysis/{ticker}/growth   → GrowthForecast                     │
 * │  GET /api/analysis/{ticker}/past     → PastPerformance                    │
 * │  GET /api/analysis/{ticker}/health   → FinancialHealth                    │
 * │  GET /api/analysis/{ticker}/dividend → DividendData                       │
 * │  GET /api/analysis/{ticker}/ownership→ OwnershipData                      │
 * │  GET /api/analysis/{ticker}/price    → PriceHistory                       │
 * │                                                                            │
 * │  GET /api/market/averages/{region}   → Médias de mercado/indústria        │
 * │  GET /api/market/risk-free-rate      → Taxa livre de risco                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { AnalysisData } from '../interfaces';

// ─── Mock data VALE3 ─────────────────────────────────────────────────────────

export const MOCK_VALE3: AnalysisData = {
  company: {
    ticker: 'VALE3',
    name: 'Vale S.A.',
    sector: 'Materiais Básicos',
    industry: 'Mineração — Minério de Ferro',
    marketCap: 'R$ 245,8 bi',
    description: 'Maior produtora mundial de minério de ferro e pelotas, também produz níquel, cobre, manganês e ferroligas.',
    exchange: 'B3',
    currency: 'BRL',
  },

  snowflake: [
    {
      dimension: 'value',
      displayName: 'Valor',
      score: 4,
      normalizedScore: 67,
      summary: 'Negociando 28% abaixo do valor justo estimado via DCF.',
      checks: [
        { id: 'v1', label: 'Subvalorizado (moderado)', description: 'Preço ≥20% abaixo do DCF', passed: true, value: '28%', threshold: '≥20%' },
        { id: 'v2', label: 'Subvalorizado (substancial)', description: 'Preço ≥40% abaixo do DCF', passed: false, value: '28%', threshold: '≥40%' },
        { id: 'v3', label: 'P/L vs Mercado', description: 'P/L abaixo da média do mercado', passed: true, value: '5.8x', threshold: '< 11.2x' },
        { id: 'v4', label: 'P/L vs Indústria', description: 'P/L abaixo da média da indústria', passed: true, value: '5.8x', threshold: '< 8.4x' },
        { id: 'v5', label: 'PEG razoável', description: 'PEG ratio entre 0 e 1', passed: false, value: '1.3', threshold: '0–1' },
        { id: 'v6', label: 'P/VP razoável', description: 'P/VP abaixo da média da indústria', passed: true, value: '1.2x', threshold: '< 1.8x' },
      ],
    },
    {
      dimension: 'future',
      displayName: 'Futuro',
      score: 3,
      normalizedScore: 50,
      summary: 'Crescimento de lucro projetado acima do mercado, mas abaixo de 20% a.a.',
      checks: [
        { id: 'f1', label: 'Lucro vs Poupança', description: 'Crescimento de lucro > taxa sem risco + inflação', passed: true, value: '12.4%', threshold: '> 7.5%' },
        { id: 'f2', label: 'Lucro vs Mercado', description: 'Crescimento de lucro > média do mercado', passed: true, value: '12.4%', threshold: '> 8.1%' },
        { id: 'f3', label: 'Receita vs Mercado', description: 'Crescimento de receita > média do mercado', passed: true, value: '6.8%', threshold: '> 5.2%' },
        { id: 'f4', label: 'Alto cresc. lucro', description: 'Crescimento de lucro > 20% a.a.', passed: false, value: '12.4%', threshold: '> 20%' },
        { id: 'f5', label: 'Alto cresc. receita', description: 'Crescimento de receita > 20% a.a.', passed: false, value: '6.8%', threshold: '> 20%' },
        { id: 'f6', label: 'ROE futuro', description: 'ROE estimado em 3 anos > 20%', passed: false, value: '18.5%', threshold: '> 20%' },
      ],
    },
    {
      dimension: 'past',
      displayName: 'Passado',
      score: 5,
      normalizedScore: 83,
      summary: 'Excelente histórico de performance com ROE e ROCE crescentes.',
      checks: [
        { id: 'p1', label: 'LPA vs Indústria', description: 'Crescimento LPA > média da indústria', passed: true, value: '15.2%', threshold: '> 9.8%' },
        { id: 'p2', label: 'LPA 5 anos', description: 'LPA atual > LPA de 5 anos atrás', passed: true, value: 'R$ 8.92 vs R$ 4.15' },
        { id: 'p3', label: 'LPA acelerando', description: 'Crescimento LPA acelerando', passed: true, value: '15.2% vs 11.8%' },
        { id: 'p4', label: 'ROE forte', description: 'ROE > 20%', passed: true, value: '24.6%', threshold: '> 20%' },
        { id: 'p5', label: 'ROCE melhorando', description: 'ROCE atual > ROCE de 3 anos atrás', passed: true, value: '22.1% vs 18.3%' },
        { id: 'p6', label: 'ROA vs Indústria', description: 'ROA > média da indústria', passed: false, value: '9.8%', threshold: '> 10.2%' },
      ],
    },
    {
      dimension: 'health',
      displayName: 'Saúde',
      score: 4,
      normalizedScore: 67,
      summary: 'Balanço sólido com boa cobertura de dívida e juros.',
      checks: [
        { id: 'h1', label: 'Liquidez curto prazo', description: 'Ativo circulante > Passivo circulante', passed: true, value: 'R$ 68.2bi vs R$ 52.1bi' },
        { id: 'h2', label: 'Liquidez longo prazo', description: 'Ativo circulante > Passivo não circulante', passed: false, value: 'R$ 68.2bi vs R$ 89.4bi' },
        { id: 'h3', label: 'Tendência D/E', description: 'D/E não aumentou em 5 anos', passed: true, value: '61% → 42%' },
        { id: 'h4', label: 'Nível de dívida', description: 'D/E < 40%', passed: false, value: '42%', threshold: '< 40%' },
        { id: 'h5', label: 'Cobertura de dívida', description: 'FCO > 20% da dívida total', passed: true, value: '38%', threshold: '> 20%' },
        { id: 'h6', label: 'Cobertura de juros', description: 'EBIT > 5× juros', passed: true, value: '8.2x', threshold: '> 5x' },
      ],
    },
    {
      dimension: 'dividend',
      displayName: 'Dividendos',
      score: 4,
      normalizedScore: 67,
      summary: 'Dividend yield acima da média com payout sustentável.',
      checks: [
        { id: 'd1', label: 'Yield vs Mercado', description: 'Yield > percentil 25 do mercado', passed: true, value: '8.2%', threshold: '> 3.5%' },
        { id: 'd2', label: 'Alto yield', description: 'Yield > percentil 75 do mercado', passed: true, value: '8.2%', threshold: '> 6.8%' },
        { id: 'd3', label: 'Estabilidade', description: 'Sem queda >10% em 10 anos', passed: false, value: 'Queda de 22% em 2020' },
        { id: 'd4', label: 'Crescimento', description: 'DPA atual > DPA de 10 anos atrás', passed: true, value: 'R$ 3.48 vs R$ 1.22' },
        { id: 'd5', label: 'Cobertura atual', description: 'Payout ratio entre 0-90%', passed: true, value: '58%', threshold: '0–90%' },
        { id: 'd6', label: 'Cobertura futura', description: 'Payout estimado em 3 anos entre 0-90%', passed: false, value: '92%', threshold: '0–90%' },
      ],
    },
  ],

  valuation: {
    fairValue: 58.40,
    currentPrice: 42.60,
    discountPercent: 27.1,
    model: '2-Stage Free Cash Flow',
    discountRate: 12.8,
    terminalGrowthRate: 2.5,
    projectedFCF: [
      { year: '2025', value: 48200 },
      { year: '2026', value: 51800 },
      { year: '2027', value: 54100 },
      { year: '2028', value: 55900 },
      { year: '2029', value: 57200 },
      { year: '2030', value: 58100 },
      { year: '2031', value: 58800 },
      { year: '2032', value: 59300 },
      { year: '2033', value: 59700 },
      { year: '2034', value: 60000 },
    ],
  },

  relativeValuation: {
    peRatio: 5.8,
    peIndustry: 8.4,
    peMarket: 11.2,
    pegRatio: 1.3,
    pbRatio: 1.2,
    pbIndustry: 1.8,
  },

  growth: {
    earningsGrowthRate: 12.4,
    revenueGrowthRate: 6.8,
    marketEarningsGrowth: 8.1,
    marketRevenueGrowth: 5.2,
    futureROE: 18.5,
    earningsSeries: [
      { year: '2020', value: 18400, type: 'historical' },
      { year: '2021', value: 42600, type: 'historical' },
      { year: '2022', value: 38200, type: 'historical' },
      { year: '2023', value: 32100, type: 'historical' },
      { year: '2024', value: 35800, type: 'historical' },
      { year: '2025', value: 39200, type: 'forecast' },
      { year: '2026', value: 43500, type: 'forecast' },
      { year: '2027', value: 47200, type: 'forecast' },
    ],
    revenueSeries: [
      { year: '2020', value: 208400, type: 'historical' },
      { year: '2021', value: 312100, type: 'historical' },
      { year: '2022', value: 284600, type: 'historical' },
      { year: '2023', value: 256200, type: 'historical' },
      { year: '2024', value: 268900, type: 'historical' },
      { year: '2025', value: 282400, type: 'forecast' },
      { year: '2026', value: 298100, type: 'forecast' },
      { year: '2027', value: 312800, type: 'forecast' },
    ],
  },

  pastPerformance: {
    epsGrowth5y: 11.8,
    epsCurrentVs5yAgo: true,
    epsAccelerating: true,
    currentROE: 24.6,
    currentROCE: 22.1,
    roce3yAgo: 18.3,
    currentROA: 9.8,
    industryROA: 10.2,
    epsSeries: [
      { year: '2019', value: 4.15 },
      { year: '2020', value: 3.82 },
      { year: '2021', value: 9.64 },
      { year: '2022', value: 8.21 },
      { year: '2023', value: 7.05 },
      { year: '2024', value: 8.92 },
    ],
    roeSeries: [
      { year: '2019', value: 15.8 },
      { year: '2020', value: 14.2 },
      { year: '2021', value: 38.6 },
      { year: '2022', value: 28.4 },
      { year: '2023', value: 21.8 },
      { year: '2024', value: 24.6 },
    ],
    roceSeries: [
      { year: '2019', value: 14.2 },
      { year: '2020', value: 12.8 },
      { year: '2021', value: 32.4 },
      { year: '2022', value: 24.1 },
      { year: '2023', value: 18.3 },
      { year: '2024', value: 22.1 },
    ],
  },

  health: {
    shortTermAssets: 68200,
    shortTermLiabilities: 52100,
    longTermLiabilities: 89400,
    debtToEquity: 42,
    debtToEquity5yAgo: 61,
    operatingCashFlow: 52800,
    totalDebt: 138600,
    interestExpense: 6800,
    ebit: 55800,
    debtToEquitySeries: [
      { year: '2019', value: 61 },
      { year: '2020', value: 58 },
      { year: '2021', value: 45 },
      { year: '2022', value: 48 },
      { year: '2023', value: 44 },
      { year: '2024', value: 42 },
    ],
    assetsVsLiabilities: {
      shortTermAssets: 68200,
      longTermAssets: 285400,
      shortTermLiabilities: 52100,
      longTermLiabilities: 89400,
    },
  },

  dividend: {
    currentYield: 8.2,
    marketYield25th: 3.5,
    marketYield75th: 6.8,
    payoutRatio: 58,
    futurePayoutRatio: 92,
    isStable: false,
    years10Growth: true,
    dividendSeries: [
      { year: '2015', value: 0.86 },
      { year: '2016', value: 0.94 },
      { year: '2017', value: 1.22 },
      { year: '2018', value: 1.58 },
      { year: '2019', value: 1.84 },
      { year: '2020', value: 1.42 },
      { year: '2021', value: 4.26 },
      { year: '2022', value: 3.68 },
      { year: '2023', value: 2.94 },
      { year: '2024', value: 3.48 },
    ],
    payoutSeries: [
      { year: '2019', value: 44 },
      { year: '2020', value: 37 },
      { year: '2021', value: 44 },
      { year: '2022', value: 45 },
      { year: '2023', value: 42 },
      { year: '2024', value: 58 },
    ],
  },

  ownership: {
    insiderBuys: 2400000,
    insiderSells: 1800000,
    institutionalOwnership: 52.3,
    publicOwnership: 36.8,
    insiderOwnership: 10.9,
    topShareholders: [
      { name: 'Previ (Banco do Brasil)', percentage: 8.2, type: 'institution' },
      { name: 'BlackRock Inc.', percentage: 6.8, type: 'institution' },
      { name: 'Capital Group', percentage: 5.1, type: 'institution' },
      { name: 'Mitsui & Co.', percentage: 4.3, type: 'institution' },
      { name: 'Bradespar S.A.', percentage: 3.6, type: 'institution' },
      { name: 'Eduardo Bartolomeo (CEO)', percentage: 0.02, type: 'insider' },
      { name: 'Público geral', percentage: 36.8, type: 'public' },
    ],
    insiderTransactions: [
      { date: '2024-11', name: 'Eduardo Bartolomeo', type: 'buy', shares: 50000, value: 2130000 },
      { date: '2024-09', name: 'Gustavo Pimenta', type: 'buy', shares: 12000, value: 510000 },
      { date: '2024-07', name: 'Mark Cutifani', type: 'sell', shares: 30000, value: 1280000 },
      { date: '2024-05', name: 'Deshnee Naidoo', type: 'sell', shares: 12000, value: 520000 },
    ],
  },

  priceHistory: {
    series: Array.from({ length: 252 }, (_, i) => {
      const date = new Date(2024, 0, 2);
      date.setDate(date.getDate() + i);
      const base = 42 + Math.sin(i / 30) * 8 + Math.random() * 3 - 1.5;
      return {
        date: date.toISOString().split('T')[0],
        price: Math.round(base * 100) / 100,
      };
    }),
    return1y: -8.5,
    return5y: 42.3,
    marketReturn1y: 2.1,
    volatilityBeta: 1.12,
  },

  // ─── New data-to-viz optimized fields ────────────────────────────────────

  priceScenarios: [
    { key: 'pessimista', label: 'Pessimista', estimatedValue: 35.20, gapVsCurrent: -17.4 },
    { key: 'base', label: 'Base (DCF)', estimatedValue: 58.40, gapVsCurrent: 37.1 },
    { key: 'otimista', label: 'Otimista', estimatedValue: 74.80, gapVsCurrent: 75.6 },
  ],

  distributions: [
    {
      metric: 'P/L',
      currentValue: 5.8,
      sectorMedian: 8.4,
      buckets: [
        { label: '0-2', value: 3, isCurrent: false, isMedian: false },
        { label: '2-4', value: 8, isCurrent: false, isMedian: false },
        { label: '4-6', value: 15, isCurrent: true, isMedian: false },
        { label: '6-8', value: 22, isCurrent: false, isMedian: false },
        { label: '8-10', value: 18, isCurrent: false, isMedian: true },
        { label: '10-12', value: 12, isCurrent: false, isMedian: false },
        { label: '12-14', value: 7, isCurrent: false, isMedian: false },
        { label: '14-16', value: 4, isCurrent: false, isMedian: false },
        { label: '16+', value: 2, isCurrent: false, isMedian: false },
      ],
    },
    {
      metric: 'EV/EBITDA',
      currentValue: 3.9,
      sectorMedian: 6.2,
      buckets: [
        { label: '0-2', value: 2, isCurrent: false, isMedian: false },
        { label: '2-4', value: 10, isCurrent: true, isMedian: false },
        { label: '4-6', value: 20, isCurrent: false, isMedian: false },
        { label: '6-8', value: 25, isCurrent: false, isMedian: true },
        { label: '8-10', value: 15, isCurrent: false, isMedian: false },
        { label: '10-12', value: 8, isCurrent: false, isMedian: false },
        { label: '12+', value: 4, isCurrent: false, isMedian: false },
      ],
    },
    {
      metric: 'P/VP',
      currentValue: 1.2,
      sectorMedian: 1.8,
      buckets: [
        { label: '0-0.5', value: 4, isCurrent: false, isMedian: false },
        { label: '0.5-1', value: 12, isCurrent: false, isMedian: false },
        { label: '1-1.5', value: 20, isCurrent: true, isMedian: false },
        { label: '1.5-2', value: 24, isCurrent: false, isMedian: true },
        { label: '2-2.5', value: 14, isCurrent: false, isMedian: false },
        { label: '2.5-3', value: 6, isCurrent: false, isMedian: false },
        { label: '3+', value: 3, isCurrent: false, isMedian: false },
      ],
    },
  ],

  timelineEvents: [
    { date: '2026-03-15', title: 'Divulgação resultado 4T25', source: 'CVM', expectedImpact: 'neutral', description: 'Lucro líquido de R$ 18,2 bi, em linha com consenso' },
    { date: '2026-02-28', title: 'Acordo de Mariana homologado', source: 'Justiça Federal', expectedImpact: 'positive', description: 'Acordo de R$ 170 bi aprovado judicialmente, removendo incerteza jurídica' },
    { date: '2026-02-10', title: 'Preço do minério cai 8% no mês', source: 'Bloomberg', expectedImpact: 'negative', description: 'Desaceleração da construção civil na China pressiona preço do minério' },
    { date: '2026-01-22', title: 'Programa de recompra de ações', source: 'Fato Relevante', expectedImpact: 'positive', description: 'Aprovado programa de recompra de até 500M de ações' },
    { date: '2025-12-15', title: 'Upgrade de rating para AA+', source: 'S&P', expectedImpact: 'positive', description: 'Melhoria no perfil de crédito reflete desalavancagem' },
    { date: '2025-11-20', title: 'Corte de produção em Carajás', source: 'Comunicado', expectedImpact: 'negative', description: 'Parada para manutenção programada reduz produção em 5% no trimestre' },
  ],

  sensitivityDrivers: [
    { key: 'iron_price', label: 'Preço do Minério de Ferro', impact: 'high' },
    { key: 'cny_demand', label: 'Demanda da China', impact: 'high' },
    { key: 'brl_usd', label: 'Câmbio BRL/USD', impact: 'high' },
    { key: 'production', label: 'Volume de Produção', impact: 'medium' },
    { key: 'capex', label: 'Investimentos (CAPEX)', impact: 'medium' },
    { key: 'wacc', label: 'Taxa de Desconto (WACC)', impact: 'medium' },
    { key: 'nickel', label: 'Preço do Níquel', impact: 'low' },
    { key: 'regulation', label: 'Regulação Ambiental', impact: 'low' },
  ],

  // ─── DCF Sensitivity Matrix (WACC × Terminal Growth → Fair Value) ────────
  dcfSensitivity: [
    // WACC rows: 8%, 9%, 10.2% (base), 11%, 12%
    // Terminal Growth cols: 1%, 1.5%, 2% (base), 2.5%, 3%
    { wacc: 8.0, terminalGrowth: 1.0, fairValue: 62.10 },
    { wacc: 8.0, terminalGrowth: 1.5, fairValue: 66.30 },
    { wacc: 8.0, terminalGrowth: 2.0, fairValue: 71.50 },
    { wacc: 8.0, terminalGrowth: 2.5, fairValue: 78.20 },
    { wacc: 8.0, terminalGrowth: 3.0, fairValue: 86.90 },
    { wacc: 9.0, terminalGrowth: 1.0, fairValue: 55.40 },
    { wacc: 9.0, terminalGrowth: 1.5, fairValue: 58.70 },
    { wacc: 9.0, terminalGrowth: 2.0, fairValue: 62.80 },
    { wacc: 9.0, terminalGrowth: 2.5, fairValue: 67.90 },
    { wacc: 9.0, terminalGrowth: 3.0, fairValue: 74.30 },
    { wacc: 10.2, terminalGrowth: 1.0, fairValue: 49.10 },
    { wacc: 10.2, terminalGrowth: 1.5, fairValue: 51.80 },
    { wacc: 10.2, terminalGrowth: 2.0, fairValue: 58.40 },
    { wacc: 10.2, terminalGrowth: 2.5, fairValue: 59.20 },
    { wacc: 10.2, terminalGrowth: 3.0, fairValue: 64.00 },
    { wacc: 11.0, terminalGrowth: 1.0, fairValue: 45.80 },
    { wacc: 11.0, terminalGrowth: 1.5, fairValue: 48.20 },
    { wacc: 11.0, terminalGrowth: 2.0, fairValue: 51.00 },
    { wacc: 11.0, terminalGrowth: 2.5, fairValue: 54.30 },
    { wacc: 11.0, terminalGrowth: 3.0, fairValue: 58.40 },
    { wacc: 12.0, terminalGrowth: 1.0, fairValue: 41.30 },
    { wacc: 12.0, terminalGrowth: 1.5, fairValue: 43.20 },
    { wacc: 12.0, terminalGrowth: 2.0, fairValue: 45.50 },
    { wacc: 12.0, terminalGrowth: 2.5, fairValue: 48.10 },
    { wacc: 12.0, terminalGrowth: 3.0, fairValue: 51.30 },
  ],

  // ─── Valuation Ratio Trends (3 years: company vs industry) ──────────────
  ratioTrends: [
    {
      metric: 'P/L',
      series: [
        { year: '2021', company: 4.2, industry: 9.1 },
        { year: '2022', company: 3.8, industry: 8.8 },
        { year: '2023', company: 6.1, industry: 8.5 },
        { year: '2024', company: 5.4, industry: 8.2 },
        { year: '2025', company: 5.8, industry: 8.4 },
      ],
    },
    {
      metric: 'EV/EBITDA',
      series: [
        { year: '2021', company: 2.9, industry: 6.8 },
        { year: '2022', company: 3.1, industry: 6.5 },
        { year: '2023', company: 4.3, industry: 6.3 },
        { year: '2024', company: 3.7, industry: 6.1 },
        { year: '2025', company: 3.9, industry: 6.2 },
      ],
    },
    {
      metric: 'P/VP',
      series: [
        { year: '2021', company: 1.5, industry: 2.0 },
        { year: '2022', company: 1.1, industry: 1.9 },
        { year: '2023', company: 1.4, industry: 1.8 },
        { year: '2024', company: 1.3, industry: 1.8 },
        { year: '2025', company: 1.2, industry: 1.8 },
      ],
    },
  ],

  // ─── Margin Evolution (5 years) ──────────────────────────────────────────
  marginSeries: [
    { year: '2021', grossMargin: 52.3, operatingMargin: 44.1, netMargin: 38.6 },
    { year: '2022', grossMargin: 45.8, operatingMargin: 37.2, netMargin: 30.4 },
    { year: '2023', grossMargin: 41.2, operatingMargin: 32.8, netMargin: 26.1 },
    { year: '2024', grossMargin: 43.5, operatingMargin: 35.6, netMargin: 28.9 },
    { year: '2025', grossMargin: 46.1, operatingMargin: 38.4, netMargin: 31.2 },
  ],

  // ─── Stock Return vs Market Return (multiple periods) ───────────────────
  returnComparison: [
    { period: '1M', stock: -3.2, market: 1.1 },
    { period: '3M', stock: -7.5, market: 3.4 },
    { period: '6M', stock: -12.1, market: 5.8 },
    { period: '1A', stock: -8.5, market: 2.1 },
    { period: '3A', stock: 18.2, market: 22.7 },
    { period: '5A', stock: 42.3, market: 38.9 },
  ],

  // ─── Insider Sentiment (quarterly buy/sell trend) ────────────────────────
  insiderSentiment: [
    { quarter: '1T24', buys: 12500000, sells: 3200000, netValue: 9300000 },
    { quarter: '2T24', buys: 8700000, sells: 5100000, netValue: 3600000 },
    { quarter: '3T24', buys: 4200000, sells: 8900000, netValue: -4700000 },
    { quarter: '4T24', buys: 15300000, sells: 2100000, netValue: 13200000 },
    { quarter: '1T25', buys: 11800000, sells: 4600000, netValue: 7200000 },
    { quarter: '2T25', buys: 6400000, sells: 7200000, netValue: -800000 },
    { quarter: '3T25', buys: 9100000, sells: 3800000, netValue: 5300000 },
    { quarter: '4T25', buys: 18200000, sells: 1500000, netValue: 16700000 },
  ],

  // ─── Dividend vs Earnings (sustainability view) ─────────────────────────
  dividendVsEarnings: [
    { year: '2016', dividend: 1.22, earnings: 2.10 },
    { year: '2017', dividend: 1.55, earnings: 3.80 },
    { year: '2018', dividend: 2.41, earnings: 4.50 },
    { year: '2019', dividend: 2.80, earnings: 3.90 },
    { year: '2020', dividend: 1.98, earnings: 3.20 },
    { year: '2021', dividend: 8.21, earnings: 12.50 },
    { year: '2022', dividend: 5.72, earnings: 8.10 },
    { year: '2023', dividend: 3.56, earnings: 5.90 },
    { year: '2024', dividend: 3.89, earnings: 6.40 },
    { year: '2025', dividend: 4.12, earnings: 6.80 },
  ],

  // ─── Rewards & Risks (SimplyWall.St style) ──────────────────────────────
  rewardsAndRisks: [
    { type: 'reward', text: 'Negociando 16.2% abaixo da estimativa de valor justo', detail: 'Preço atual R$48.89 vs fair value R$58.40' },
    { type: 'reward', text: 'Lucros devem crescer 18.2% ao ano', detail: 'Acima da média do mercado de 14.5%' },
    { type: 'reward', text: 'Lucros cresceram 22.3% no último ano', detail: 'Superando a média do setor de 15.1%' },
    { type: 'reward', text: 'Dividendo de 8.2% acima do 75º percentil do mercado', detail: 'Yield robusto e sustentável' },
    { type: 'reward', text: 'Dívida bem coberta pelo fluxo de caixa operacional', detail: 'FCO/Dívida Total = 48.3%' },
    { type: 'risk', text: 'Dividendo instável nos últimos 10 anos', detail: 'Quedas significativas em 2020 e 2023' },
    { type: 'risk', text: 'Alta exposição ao preço do minério de ferro', detail: '68% da receita ligada a commodities de ferro' },
    { type: 'risk', text: 'Margens estão comprimindo vs 3 anos atrás', detail: 'Margem líquida caiu de 38.6% para 31.2%' },
  ],

  // ─── Competitors with Snowflake Scores ──────────────────────────────────
  competitors: [
    { ticker: 'CSNA3', name: 'CSN', exchange: 'BOVESPA', marketCap: 'R$ 18.5B', scores: { value: 65, future: 40, past: 55, health: 30, dividend: 70 } },
    { ticker: 'GGBR4', name: 'Gerdau', exchange: 'BOVESPA', marketCap: 'R$ 42.1B', scores: { value: 50, future: 55, past: 70, health: 75, dividend: 60 } },
    { ticker: 'USIM5', name: 'Usiminas', exchange: 'BOVESPA', marketCap: 'R$ 8.2B', scores: { value: 70, future: 35, past: 40, health: 45, dividend: 55 } },
    { ticker: 'CMIN3', name: 'CSN Mineração', exchange: 'BOVESPA', marketCap: 'R$ 15.8B', scores: { value: 60, future: 50, past: 45, health: 55, dividend: 65 } },
  ],

  // ─── Analyst Price Targets (12 months history) ──────────────────────────
  analystTargets: [
    { date: '2025-04', price: 62.50, consensusTarget: 72.00, low: 58.00, high: 85.00 },
    { date: '2025-06', price: 58.30, consensusTarget: 70.50, low: 55.00, high: 82.00 },
    { date: '2025-08', price: 55.10, consensusTarget: 68.00, low: 52.00, high: 80.00 },
    { date: '2025-10', price: 52.40, consensusTarget: 65.50, low: 50.00, high: 78.00 },
    { date: '2025-12', price: 50.20, consensusTarget: 63.00, low: 48.00, high: 75.00 },
    { date: '2026-01', price: 49.80, consensusTarget: 62.00, low: 47.00, high: 74.00 },
    { date: '2026-03', price: 48.89, consensusTarget: 61.50, low: 46.00, high: 73.00 },
  ],

  // ─── Market Cap Composition (donut) ─────────────────────────────────────
  marketCapComposition: {
    earnings: 42800,   // R$ M
    revenue: 198500,   // R$ M
    marketCap: 248500,  // R$ M
    peRatio: 5.8,
    psRatio: 1.25,
  },

  // ─── Earnings & Revenue Series (grouped bars) ───────────────────────────
  earningsRevenueSeries: [
    { year: '2020', revenue: 208200, earnings: 26800, type: 'historical' },
    { year: '2021', revenue: 319700, earnings: 121500, type: 'historical' },
    { year: '2022', revenue: 274100, earnings: 78400, type: 'historical' },
    { year: '2023', revenue: 203600, earnings: 39800, type: 'historical' },
    { year: '2024', revenue: 215900, earnings: 48200, type: 'historical' },
    { year: '2025', revenue: 198500, earnings: 42800, type: 'historical' },
    { year: '2026E', revenue: 215000, earnings: 50600, type: 'forecast' },
    { year: '2027E', revenue: 232000, earnings: 59800, type: 'forecast' },
  ],

  // ─── Price Events (colored dots on price chart) ─────────────────────────
  priceEvents: [
    { date: '2025-05-15', category: 'dividend', title: 'Ex-dividendo R$ 1.82' },
    { date: '2025-07-20', category: 'financial', title: 'Resultado 2T25' },
    { date: '2025-08-10', category: 'strategy', title: 'Acordo com China Baowu' },
    { date: '2025-10-25', category: 'financial', title: 'Resultado 3T25' },
    { date: '2025-11-15', category: 'dividend', title: 'Ex-dividendo R$ 2.30' },
    { date: '2025-12-05', category: 'management', title: 'Novo CFO nomeado' },
    { date: '2026-01-30', category: 'financial', title: 'Resultado 4T25' },
    { date: '2026-02-15', category: 'strategy', title: 'Expansão S11D aprovada' },
    { date: '2026-03-10', category: 'other', title: 'Rompimento de barragem (risco)' },
  ],

  // ─── Community Fair Values (histogram) ──────────────────────────────────
  communityFairValues: [
    { priceRange: 'R$35-40', count: 3 },
    { priceRange: 'R$40-45', count: 8 },
    { priceRange: 'R$45-50', count: 15 },
    { priceRange: 'R$50-55', count: 28 },
    { priceRange: 'R$55-60', count: 42 },
    { priceRange: 'R$60-65', count: 35 },
    { priceRange: 'R$65-70', count: 22 },
    { priceRange: 'R$70-75', count: 12 },
    { priceRange: 'R$75-80', count: 5 },
    { priceRange: 'R$80-85', count: 2 },
  ],
};

// ─── Fetcher ─────────────────────────────────────────────────────────────────

export function getAnalysisData(ticker: string): AnalysisData {
  // Em produção, chamaria: apiFetch<AnalysisData>(`/api/analysis/${ticker}`, {}, token)
  // Por enquanto, retorna mock.
  const mocks: Record<string, AnalysisData> = {
    VALE3: MOCK_VALE3,
  };
  return mocks[ticker.toUpperCase()] ?? MOCK_VALE3;
}
