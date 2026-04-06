# Prompt: Paridade completa Compare ↔ Analysis (Front + Back)

## Contexto

- **Frontend:** `C:\Users\guilh\Desktop\analiso-frontend` (Next.js 15 App Router + TypeScript + Tailwind v4)
- **Backend:** `C:\Users\guilh\Desktop\analiso-backend` (Spring Boot 4.0.3 + Java records)
- **Objetivo:** Levar a página de comparação (`/comparar`, feature `src/features/compare`) a ter **paridade 100%** com os cinco tabs da página de análise (`/empresa/{ticker}`, feature `src/features/analysis`), mantendo o layout side-by-side (A vs B).

### Arquivos-chave já existentes

**Frontend:**
- Ilhas: `src/features/compare/components/islands/{ValuationIsland, GrowthIsland, PastIsland, HealthIsland, DividendIsland}.tsx`
- Tipos: `src/features/compare/interfaces/index.ts` (`CompareEnrichedCompany`, `CompareValuation`, `CompareGrowth`, `ComparePastPerformance`, `CompareHealth`, `CompareDividend`, `CompareRatioTrend`, `CompareDCFSensitivityCell`, `CompareCompetitor`)
- Serviço: `src/features/compare/services/index.ts` (função `mapAnalysisToEnriched(raw, ticker)` e `fetchCompareData(tickerA, tickerB)`)
- Hook: `src/features/compare/hooks/useCompare.ts`
- Referência de origem (o que precisa ser portado): `src/features/analysis/components/{ValueTab, FutureTab, PastTab, HealthTab, DividendTab}.tsx` + `src/features/analysis/components/SankeySection.tsx`

**Backend:**
- `src/main/java/com/analiso/compare/CompareController.java` — endpoint `GET /api/v2/compare?tickerA=&tickerB=`
- `src/main/java/com/analiso/compare/dto/CompareResponse.java` — record `{ a: AnalysisResponse, b: AnalysisResponse }`
- `src/main/java/com/analiso/companyanalysis/dto/AnalysisResponse.java` — já contém praticamente tudo que o front precisa (a estratégia preferida é **reaproveitar** `AnalysisResponse` e só estender quando faltar campo)
- `src/main/java/com/analiso/config/security/SecurityConfig.java` — endpoint já está em `permitAll()`

### Princípios de design (obrigatórios)

1. **Reading Cards e Criteria Cards primeiro.** São 10 componentes arquiteturais novos que se repetem em todas as ilhas — crie componentes reutilizáveis genéricos.
2. **Side-by-side consistente.** Quando o componente do analysis é “single-company”, no compare ele vira dois (A e B) dentro de `compare-side-grid` (grid `1fr 1fr`, 1 coluna no mobile).
3. **Tamanho de gráficos já sob controle.** Todo SVG novo deve seguir o padrão atual: `viewBox` + `className="w-full max-w-[340-460px] mx-auto"` + `preserveAspectRatio="xMidYMid meet"`.
4. **Cores por lado (semantic tokens).** Empresa A usa `var(--brand)` / `var(--brand-surface)` / `text-brand-text` / `border-brand-border`. Empresa B usa `var(--compare-b)` / `var(--compare-b-surface)` / `text-compare-b-text` / `border-compare-b-border`.
5. **Sem libs de chart externas.** Todos os charts novos devem ser SVG custom (nenhum Recharts/Tremor nos islands de compare).
6. **Sem emojis.** Não adicionar emojis em arquivos.
7. **Reutilizar `mapAnalysisToEnriched`.** Qualquer campo novo no backend precisa ser extraído uma vez no mapper e tipado em `interfaces/index.ts`.
8. **Mocks.** Atualizar `wegEnriched`, `valeEnriched`, `itubEnriched` em `services/index.ts` com os novos campos (valores plausíveis).

---

## Tarefas — Lista completa

A auditoria abaixo identificou **~24 itens faltantes**. Execute em 5 fases.

---

## 🔹 FASE 1 — Base reutilizável: Reading Cards + Criteria Cards

Objetivo: criar dois componentes genéricos que serão reutilizados nas 5 ilhas.

### 1.1 Backend (se ainda não existir no `AnalysisResponse`)

Verifique no `AnalysisResponse.java` se já há algo como `valueReading`, `futureReading`, `pastReading`, `healthReading`, `dividendReading`. Estrutura esperada (cada um):

```java
public record DimensionReading(
    String headline,              // ex: "Preço abaixo do valor estimado"
    String subtitle,              // ex: "Desconto de 18% sobre o DCF"
    String badge,                 // "ATRATIVO" | "COM_DESCONTO" | "NEUTRO" | "COM_PREMIO" | ...
    List<ReadingEvidence> evidences,   // até 3
    List<ReadingLimitation> limitations,// até 2
    String synthesis              // parágrafo final (opcional)
) {}

public record ReadingEvidence(
    String observed,   // "P/L 8,2x"
    String reference,  // "Indústria 15,4x"
    String criterion,  // "P/L abaixo da indústria"
    String microText   // comentário curto
) {}

public record ReadingLimitation(
    String observed, String reference, String criterion, String microText
) {}
```

E os critérios da dimensão (DimensionCheckCard):

```java
public record DimensionCheck(
    String dimension,             // "value"|"future"|"past"|"health"|"dividend"
    int passed,                   // ex: 4
    int total,                    // ex: 6
    List<DimensionCheckItem> items
) {}

public record DimensionCheckItem(
    String label,      // "P/L abaixo da indústria"
    boolean passes,
    String observed,   // "8,2x"
    String reference,  // "15,4x"
    String microText   // "desconto relevante"
) {}
```

Exponha esses campos em `AnalysisResponse` caso estejam ausentes. Se já existem com outro nome, apenas anote a correspondência no mapper.

### 1.2 Frontend — tipos

Em `src/features/compare/interfaces/index.ts` adicionar:

```ts
export interface CompareReadingEvidence { observed: string; reference: string; criterion: string; microText: string; }
export interface CompareReadingLimitation { observed: string; reference: string; criterion: string; microText: string; }
export interface CompareDimensionReading {
  headline: string;
  subtitle: string;
  badge: string;
  evidences: CompareReadingEvidence[];
  limitations: CompareReadingLimitation[];
  synthesis?: string;
}
export interface CompareDimensionCheckItem {
  label: string;
  passes: boolean;
  observed: string;
  reference: string;
  microText: string;
}
export interface CompareDimensionCheck {
  dimension: "value" | "future" | "past" | "health" | "dividend";
  passed: number;
  total: number;
  items: CompareDimensionCheckItem[];
}
```

E em `CompareEnrichedCompany`:

```ts
readings: {
  value: CompareDimensionReading;
  future: CompareDimensionReading;
  past: CompareDimensionReading;
  health: CompareDimensionReading;
  dividend: CompareDimensionReading;
};
dimensionChecks: {
  value: CompareDimensionCheck;
  future: CompareDimensionCheck;
  past: CompareDimensionCheck;
  health: CompareDimensionCheck;
  dividend: CompareDimensionCheck;
};
```

### 1.3 Frontend — componentes reutilizáveis

Criar dois arquivos novos:

- `src/features/compare/components/shared/CompareReadingCard.tsx`
  - Props: `{ a: CompareDimensionReading; b: CompareDimensionReading; tickerA: string; tickerB: string; dimension: "value"|...; }`
  - Render: duas colunas (side-by-side), cada uma com headline, subtitle, badge colorido, evidências (lista com accent bar azul/brand), limitações (accent bar amber), e síntese no rodapé.
  - No mobile: empilhar em 1 coluna.
  - Visualmente alinhado com `ValuationReadingCard` do analysis.

- `src/features/compare/components/shared/CompareDimensionCheckCard.tsx`
  - Props: `{ a: CompareDimensionCheck; b: CompareDimensionCheck; tickerA: string; tickerB: string; }`
  - Render: tabela com coluna central “Critério” e colunas laterais para cada empresa mostrando ✓/✗ + observed/reference/microText. Resumo `X/Y` aprovados no rodapé.

### 1.4 Integração nas 5 ilhas

Em cada uma das 5 ilhas (`ValuationIsland`, `GrowthIsland`, `PastIsland`, `HealthIsland`, `DividendIsland`) adicionar **no topo**:

```tsx
<CompareReadingCard a={a.readings.value} b={b.readings.value} tickerA={a.ticker} tickerB={b.ticker} dimension="value" />
<CompareDimensionCheckCard a={a.dimensionChecks.value} b={b.dimensionChecks.value} tickerA={a.ticker} tickerB={b.ticker} />
```

(trocando `value` pela dimensão correta em cada ilha).

### 1.5 Mapper + mocks

- `mapAnalysisToEnriched`: extrair `raw.valueReading`, `raw.futureReading`, etc. (ou os nomes reais do backend) e popular `enriched.readings.*` e `enriched.dimensionChecks.*`.
- Atualizar os 3 mocks com valores plausíveis.

---

## 🔹 FASE 2 — Balance Sheet Structure (aparece 2×: Past e Health)

### 2.1 Backend

Verificar em `AnalysisResponse` se existe algo como `balanceSheetSegments` / `balanceSheetStructure` com breakdown granular:

```java
public record BalanceSheetBreakdown(
    List<BalanceSheetSegment> assets,        // ordem: Caixa&CP, Recebíveis, Estoques, Físicos, LP&Outros
    List<BalanceSheetSegment> liabilities    // ordem: Contas a Pagar, Dívida, Outros Passivos, PL
) {}

public record BalanceSheetSegment(
    String key,        // "cash" | "receivables" | "inventory" | "physical" | "longTermOther" | "payables" | "debt" | "otherLiab" | "equity"
    String label,      // "Caixa & CP"
    double value,      // R$
    double percent     // fração do total (0..1)
) {}
```

Expor em `AnalysisResponse.pastData.balanceSheet` e/ou `healthData.balanceSheet`. Se não existir, calcular a partir dos campos brutos do balanço que já existem.

### 2.2 Frontend — tipos

Adicionar em `interfaces/index.ts`:

```ts
export interface CompareBalanceSegment {
  key: string;
  label: string;
  value: number;
  percent: number;
}
export interface CompareBalanceSheet {
  assets: CompareBalanceSegment[];
  liabilities: CompareBalanceSegment[];
}
```

Adicionar `balanceSheet: CompareBalanceSheet` em `ComparePastPerformance` **e** `CompareHealth`.

### 2.3 Frontend — componente

Criar `src/features/compare/components/shared/CompareBalanceSheetStructure.tsx`:
- Reproduz o stacked-bar espelhado do `PastTab`/`HealthTab`.
- Em vez de uma barra, renderiza **duas** (A em cima, B embaixo) para facilitar comparação visual.
- Tabela de legenda abaixo com segmentos lado a lado (coluna `{tickerA}`, coluna `Segmento`, coluna `{tickerB}`).

Adicionar esse componente tanto em `PastIsland` como em `HealthIsland` como seção própria.

---

## 🔹 FASE 3 — Gráficos inteiros faltando

### 3.1 Valuation

#### 3.1.1 `PEVsIndustryChart` (histograma de distribuição setorial)
- **Backend:** `AnalysisResponse.valuation.peIndustryDistribution` → `List<HistogramBin { double lower; double upper; int count; }>` + `double companyPE`, `double industryMedian`, `double p25`, `double p75`.
- **Frontend tipos:** `CompareValuation.peIndustryDistribution?: { bins: { lower: number; upper: number; count: number; }[]; companyPE: number; industryMedian: number; p25: number; p75: number; }`
- **Frontend componente:** dois histogramas lado a lado (um por empresa) dentro de `compare-side-grid`, com marcador da posição da empresa, banda P25-P75 e linha da média do setor.

#### 3.1.2 `FairPEGauge`
- **Backend:** campos já devem existir (`valuation.pe`, `valuation.fairPE`, `valuation.peMarket`). Verificar se tem `fairPE`; se não, adicionar.
- **Frontend tipos:** adicionar `fairPE: number` em `CompareValuation`.
- **Frontend componente:** gauge radial com ponteiro azul do P/L atual e marcador amber do P/L justo. Dois gauges lado a lado.

#### 3.1.3 `KeyValuationMetricDonut` (P/L, P/S, P/VP)
- **Backend:** `valuation.ps` (price/sales) pode não existir — adicionar se faltar.
- **Frontend tipos:** adicionar `ps: number` em `CompareValuation`.
- **Frontend componente:** donut chart simples (SVG) mostrando a composição do market cap por cada múltiplo, com tabs P/L/P/S/P/VP. Dois donuts lado a lado.

#### 3.1.4 `HistoricalRatioChart` — versão P/VP
- **Backend:** `valuation.ratioTrends` já existe como `List<RatioTrend>` com `metric` e `series`. Garantir que backend preenche também para `"P/VP"` (hoje só "P/L" está garantido).
- **Frontend:** adicionar tab “P/L | P/VP” em cima do `PLTrendChart` existente, renomeando-o para `RatioTrendChart` e lendo de `ratioTrends.find(t => t.metric === selected)`.

### 3.2 Growth / Future

#### 3.2.1 Séries FCL e FCO no chart principal
- **Backend:** `AnalysisResponse.growthData` deve ter `freeCashFlowSeries` e `operatingCashFlowSeries` (aparentemente o FCL já existe como `growthData.freeCashFlowSeries`). Adicionar `operatingCashFlowSeries` se faltar.
- **Frontend tipos:** adicionar `operatingCashFlowSeries: Array<{ year: number; value: number; type: "historical"|"forecast" }>` em `CompareGrowth` (FCL já existe).
- **Frontend:** estender `RevenueEarningsChart` para plotar 4 séries (Receita bars + Lucro/FCL/FCO lines).

#### 3.2.2 `KeyInformationCard` (Future)
- **Backend:** garantir `growthData.projectedEPS`, `growthData.analystCoverage`, `growthData.lastUpdated`. Adicionar se faltar.
- **Frontend tipos:** adicionar esses 3 campos em `CompareGrowth`.
- **Frontend componente:** tabela 2 colunas (A | Métrica | B) com 7 linhas: Lucro projetado, Receita projetada, Média mercado lucro, Média mercado receita, ROE esperado, LPA projetado, Cobertura analistas, Última atualização.

### 3.3 Past

#### 3.3.1 Séries FCL, FCO, Opex no chart histórico
- **Backend:** `pastData` deve expor `freeCashFlowSeries`, `operatingCashFlowSeries`, `operatingExpensesSeries`.
- **Frontend tipos:** adicionar essas 3 séries em `ComparePastPerformance`.
- **Frontend:** estender `RevEarningsChart` do `PastIsland` para aceitar toggle de séries (bars receita + 4 linhas).

#### 3.3.2 `ROAGauge` (separado do ROE/ROCE)
- **Backend:** `pastData.roa` já existe (foi adicionado). Confirmar.
- **Frontend:** adicionar um terceiro `SemiGauge` em `ReturnGauges` (grid 3 colunas: ROE | ROA | ROCE).

### 3.4 Health

#### 3.4.1 Refazer `FinancialPositionCard` como `DualBalanceBars`
- **Frontend only:** reescrever para mostrar 2 barras verticais pareadas (Ativos vs Passivos) para Curto Prazo e outras 2 para Longo Prazo, espelhando o visual do `HealthTab` (BalanceBarChart). Manter o layout side-by-side A/B.

### 3.5 Dividend

#### 3.5.1 Diagnóstico nos `CoverageBar` (Payout e Cash Payout)
- **Backend:** `dividendData.payoutRatioDiagnosis` e `dividendData.cashPayoutRatioDiagnosis` com estrutura `{ status: "COVERED"|"PRESSURED"|"NOT_COVERED"; text: string; }`. Adicionar se faltar.
- **Frontend tipos:** `CompareDividend.payoutRatioDiagnosis` e `cashPayoutRatioDiagnosis`.
- **Frontend:** adicionar box de diagnóstico sob cada barra no `CoverageBar`.

#### 3.5.2 `InterestCoverageBarCard` (visual com zonas Ok/Warn/Risk)
- **Backend:** verificar `healthData.interestCoverageDiagnosis` — adicionar se não existir.
- **Frontend:** criar novo componente `InterestCoverageBar` replicando o padrão do `CoverageBar` e adicionar como 5ª seção no `DividendIsland` (ou como seção extra no `HealthIsland` — padronizar com analysis).

---

## 🔹 FASE 4 — Critérios específicos dentro das seções

Alguns critérios não vão pro `DimensionCheckCard` (que é o resumo) mas aparecem inline abaixo de gráficos no analysis:

### 4.1 Backend

Expandir `AnalysisResponse` para incluir arrays de critérios por seção:

```java
public record SectionCriteria(List<SectionCriteriaItem> items) {}
public record SectionCriteriaItem(
    String label,      // "Alto Crescimento de Lucros"
    boolean passes,
    String statement   // texto completo: "Lucro cresce 18% a.a., acima do limite de 10%"
) {}
```

Adicionar:
- `growthData.analystForecastCriteria` (5 items)
- `pastData.earningsQualityCriteria` (2 items)
- `pastData.fcfCriteria` (2 items)
- `pastData.growthCriteria` (3 items)
- `healthData.positionCriteria` (2 items)
- `healthData.debtCriteria` (4 items: Nível, Redução, Cobertura Dívida, Cobertura Juros)

### 4.2 Frontend

Adicionar esses arrays aos respectivos tipos em `interfaces/index.ts` e extrair no mapper.

Criar componente reutilizável `src/features/compare/components/shared/CompareSectionCriteria.tsx`:
- Props: `{ a: SectionCriteriaItem[]; b: SectionCriteriaItem[]; tickerA: string; tickerB: string; }`
- Render: tabela compacta com coluna central de rótulo e ✓/✗ + statement truncado em cada lado.

Usar esse componente abaixo das respectivas seções em cada ilha:
- **Growth:** abaixo do `GrowthBarSection` (5 critérios analistas)
- **Past:** abaixo de `RevEarningsChart` (2 qualidade), abaixo de `WaterfallFCF` (2 FCF), abaixo de `GrowthBars` (3 crescimento)
- **Health:** abaixo de `FinancialPositionCard` (2 posição), substituir `HealthCriteriaTable` atual pelos 4 critérios corretos com labels alinhados ao analysis (Nível de endividamento, Redução da dívida, Cobertura da dívida, Cobertura de juros)

---

## 🔹 FASE 5 — Polimento final

1. **Verificar build:**
   - Frontend: `npx tsc --noEmit` deve passar (ignorar erros pré-existentes não-relacionados).
   - Backend: `./mvnw compile` ou `./gradlew build`.
2. **Verificar no browser:** com o backend rodando, abrir `/comparar?tickerA=WEGE3&tickerB=VALE3` e conferir visualmente que cada ilha tem:
   - [ ] Reading Card no topo
   - [ ] Dimension Check Card
   - [ ] Todos os gráficos/seções da tabela de auditoria abaixo
3. **Fallbacks:** toda seção deve lidar com dados ausentes (`?? []`, `?? 0`, ou render condicional com mensagem “Dados indisponíveis”).
4. **Acessibilidade:** manter os rótulos de SVG acessíveis (`<title>`, `aria-label` onde fizer sentido).
5. **Garantir que `SecurityConfig.java` continua com `.requestMatchers(HttpMethod.GET, "/api/v2/compare").permitAll()`**.

---

## 📋 Checklist de auditoria — o que precisa existir no final

Use esta lista para validação no final da implementação:

### ValuationIsland
- [ ] CompareReadingCard (value)
- [ ] CompareDimensionCheckCard (value)
- [ ] FairValueBar (✅ já existe)
- [ ] MultiplesTable (✅ já existe)
- [ ] PriceScenarioScale (✅ já existe)
- [ ] DCFHeatmap (✅ já existe)
- [ ] RatioTrendChart com tabs P/L e P/VP (hoje só P/L)
- [ ] PEVsPeersChart (✅ já existe)
- [ ] **PEVsIndustryChart** (novo)
- [ ] **FairPEGauge** (novo)
- [ ] **KeyValuationMetricDonut** (novo)

### GrowthIsland
- [ ] CompareReadingCard (future)
- [ ] CompareDimensionCheckCard (future)
- [ ] GrowthBarSection (✅)
- [ ] CompareSectionCriteria × 5 critérios analistas (novo)
- [ ] EpsAreaChart (✅)
- [ ] RevenueEarningsChart com 4 séries: Receita/Lucro/FCL/FCO (ampliar)
- [ ] ROEGauge (✅)
- [ ] **KeyInformationCard** (novo)

### PastIsland
- [ ] CompareReadingCard (past)
- [ ] CompareDimensionCheckCard (past)
- [ ] RevEarningsChart com 5 séries: Receita/Lucro/FCL/FCO/Opex (ampliar)
- [ ] CompareSectionCriteria × 2 (Qualidade Lucros, Margem Crescente)
- [ ] WaterfallFCF (✅)
- [ ] CompareSectionCriteria × 2 (FCL Positivo, FCL vs Lucro)
- [ ] GrowthBars (✅)
- [ ] CompareSectionCriteria × 3 (Lucros vs Setor, Alto Cresc., Receita vs Setor)
- [ ] ReturnGauges com ROE + **ROA** + ROCE (hoje só ROE/ROCE)
- [ ] MarginsTable (✅)
- [ ] **CompareBalanceSheetStructure** (novo)

### HealthIsland
- [ ] CompareReadingCard (health)
- [ ] CompareDimensionCheckCard (health)
- [ ] DualBalanceBars redesenhado (substituindo FinancialPositionCard stacked)
- [ ] CompareSectionCriteria × 2 (Passivos CP, Passivo LP)
- [ ] DebtHistoryChart (✅)
- [ ] CompareSectionCriteria × 4 com labels corretos (Nível, Redução, Cobertura Dívida, Cobertura Juros)
- [ ] DETrendChart (✅ — manter como extra)
- [ ] DebtSummaryKPIs (✅ — manter como extra)
- [ ] **CompareBalanceSheetStructure** (novo, mesmo componente da Past)

### DividendIsland
- [ ] CompareReadingCard (dividend)
- [ ] CompareDimensionCheckCard (dividend)
- [ ] KpiTable (✅)
- [ ] DpaChart (✅)
- [ ] YieldDotPlot (✅)
- [ ] CoverageBar com **diagnóstico** (Coberto/Pressionado/Risco) abaixo de cada barra
- [ ] **InterestCoverageBar** (novo)
- [ ] ShareholderReturn (✅)

---

## 🚀 Execução recomendada

Implemente nesta ordem exata para evitar retrabalho:

1. **Fase 1** (Reading + Dimension cards) — base reutilizável: destrava 10 itens de uma vez
2. **Fase 2** (Balance Sheet Structure) — destrava 2 itens de uma vez
3. **Fase 4** (critérios inline) — destrava 18 checks de uma vez com 1 componente
4. **Fase 3** (gráficos isolados) — um por um
5. **Fase 5** (polimento + build check)

Para cada fase:
1. Comece pelo backend (DTO + mapper se necessário).
2. Atualize `interfaces/index.ts` e `mapAnalysisToEnriched`.
3. Atualize os 3 mocks.
4. Crie/atualize componentes do frontend.
5. Valide com `npx tsc --noEmit` (só considerar erros novos nos arquivos tocados).

## Restrições

- **Nunca** quebre build TypeScript em arquivos que você não tocou (erros pré-existentes em `FutureTab.tsx`, `OverviewTab.tsx`, `CompanyAnalysisPage.tsx`, `explore/services`, `CompanyExploreMock.tsx`, `ProfilePage.tsx`, `watchlist/services`, `tailwind.config.ts` são conhecidos e devem ser ignorados).
- **Nunca** use emojis nos arquivos de código.
- **Nunca** crie arquivos `.md` de documentação a menos que o usuário peça explicitamente.
- **Sempre** use os tokens semânticos de cor (`var(--brand)`, `text-brand-text`, etc.) em vez de hex fixos (exceto para zonas de semáforo verde/amarelo/vermelho).
- **Sempre** mantenha os SVGs responsivos com `max-w-[Npx] mx-auto`.
- **Nunca** edite `src/features/analysis/**` — a página de análise é a fonte de verdade e não deve ser modificada.
