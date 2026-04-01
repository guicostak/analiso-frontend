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

import type { AnalysisData, DimensionScore, SnowflakeDimension } from '../interfaces';
import { apiFetch } from '@/src/lib/api';

/**
 * Maps backend pillar keys to frontend snowflake dimensions.
 * Backend has 7 pillars; frontend groups them into 5 dimensions.
 */
const PILLAR_TO_DIMENSION: Record<string, { dimension: SnowflakeDimension; displayName: string }> = {
  valuation: { dimension: 'value', displayName: 'Valuation' },
  retorno:   { dimension: 'future', displayName: 'Futuro' },
  margens:   { dimension: 'past', displayName: 'Desempenho' },
  divida:    { dimension: 'health', displayName: 'Saúde Financeira' },
  proventos: { dimension: 'dividend', displayName: 'Dividendos' },
};

/**
 * Transforms the backend response (radar/pillars model) into the
 * frontend AnalysisData shape (snowflake/dimensions model).
 */
function transformBackendResponse(raw: Record<string, unknown>): AnalysisData {
  const radar = (raw.radar ?? {}) as Record<string, Record<string, number | null>>;
  const currentScores = radar.current ?? {};

  const snowflake: DimensionScore[] = Object.entries(PILLAR_TO_DIMENSION).map(
    ([pillarKey, { dimension, displayName }]) => {
      const rawScore = currentScores[pillarKey] ?? 0;
      // Backend scores are 0-100; convert to 0-6 for checks display
      const score = Math.round((rawScore / 100) * 6);
      return {
        dimension,
        displayName,
        score,
        normalizedScore: rawScore,
        checks: [],
        summary: '',
      };
    },
  );

  return {
    ...(raw as unknown as AnalysisData),
    snowflake,
  };
}

/**
 * Fetch analysis data from the backend endpoint.
 * Transforms the response to match the frontend AnalysisData interface.
 */
export async function fetchAnalysisData(
  ticker: string,
  token?: string | null,
): Promise<AnalysisData> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/company-analysis/${ticker.toUpperCase()}`,
    {},
    token,
  );
  return transformBackendResponse(raw);
}
