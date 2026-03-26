# Relatório: Melhores Gráficos para o Backend Analiso
## Baseado em data-to-viz.com × Dados reais do Backend

---

## 1. INVENTÁRIO DE DADOS DO BACKEND

### 1.1 Dados Numéricos de Série Temporal (Ordered Numeric)
| Dado | Entidade Backend | Tipo | Granularidade |
|------|-----------------|------|---------------|
| Preço histórico | `company_analysis_price_chart` | Contínuo | Diário |
| Valor justo vs preço | `price_context` + `price_scenarios` | Contínuo | Por análise |
| Métricas por pilar (chart_points) | `pillar_chart_points` | Contínuo | Anual (year_label) |
| Série de mercado (P/L, EV/EBITDA, P/VP) | `company_market_series` | Contínuo | Multiperíodo |
| Score do pilar ao longo do tempo | `company_bundle_scores` | Discreto (0-100) | Por run |

### 1.2 Dados Categóricos + Numéricos
| Dado | Entidade Backend | Categorias |
|------|-----------------|------------|
| Scores por pilar (7 dimensões) | `company_analysis_pillars` | Divida, Caixa, Margens, Retorno, Proventos, Valuation, Negocio |
| Status por pilar | `company_analysis_pillars.status` | positive, attention, negative, unknown |
| Métricas comparativas (empresa vs setor vs histórico) | `company_market_snapshot` | current_value, sector_value, historical_value |
| Distribuição de métricas (P/L, EV/EBITDA, P/VP) | `price_distribution` | Buckets com is_current, is_median |
| Evidências com intensidade | `pillar_evidences` | strong, weak |
| Severidade de mudanças | `company_analysis_changes` | high, medium, low |

### 1.3 Dados Hierárquicos / Part-of-Whole
| Dado | Entidade Backend |
|------|-----------------|
| Watchlist prioridades (priority, feed, list) | `watchlist_copy_items.section` |
| Pilares dentro de overview | `company_analysis_overview` → pillars |

### 1.4 Dados de Fluxo / Conexão
| Dado | Entidade Backend |
|------|-----------------|
| Timeline de eventos corporativos | `company_analysis_timeline_events` |
| Mudanças (antes/depois) | `company_analysis_changes` |
| Fontes de dados | `company_analysis_sources` |

---

## 2. RECOMENDAÇÕES DATA-TO-VIZ POR TIPO DE DADO

### 2.1 SÉRIE TEMPORAL (Preço, Métricas ao Longo do Tempo)

**Regra data-to-viz**: "Several Ordered Numeric" → Line Plot, Area Chart

| Gráfico Atual | Problema (Caveat) | Recomendação Otimizada |
|--------------|-------------------|----------------------|
| AreaChart (preço) | OK, mas sem anotações | **Area Chart com anotações** de eventos do timeline (`timeline_events`) sobrepondo o gráfico de preço |
| BarChart (FCF projetado) | Barras para série temporal é subótimo | **Connected Scatter / Lollipop** para destacar cada ano com linha de tendência |
| BarChart (lucro/receita histórico+forecast) | Barras ok para comparação, mas forecast deve ser distinguido | **Bar Chart com padrão listrado** para forecast + **Reference Line** para separar histórico de projeção |
| LineChart (ROCE trend) | ✅ Correto para evolução | Manter, adicionar **banda de confiança** (área sombreada) |

**Caveats aplicáveis**:
- ⚠️ **Y-Axis Cutting**: Nunca cortar Y em gráficos de preço (usar `domain={[0, 'auto']}`)
- ⚠️ **Dual Axes**: Evitar. Se precisar mostrar preço + volume, usar **small multiples** (gráficos separados empilhados)
- ⚠️ **Spaghetti Charts**: Se comparar múltiplos tickers, limitar a 5 linhas ou usar faceting

---

### 2.2 COMPARAÇÃO NUMÉRICA × CATEGÓRICA (Empresa vs Setor vs Mercado)

**Regra data-to-viz**: "One Numeric + One Categorical" → Barplot, Lollipop Plot

| Gráfico Atual | Problema | Recomendação Otimizada |
|--------------|---------|----------------------|
| Horizontal bars (P/L, P/VP comparativo) | OK conceptualmente | **Lollipop Plot horizontal** — mais limpo que barras (caveat #33 Moiré Effect), com cores semânticas (verde = favorável) |
| Gauge (PEG, ROE futuro) | Gauge não é recomendado pelo data-to-viz | **Bullet Chart** — combina valor atual, target, e faixas qualitativas (melhor que gauge) |
| Pie Chart (composição acionária) | ❌ data-to-viz: "Human eye is bad at reading angles" | **Treemap** ou **Stacked Horizontal Bar** — 1 barra com segmentos proporcionais |

**Caveats aplicáveis**:
- ⚠️ **Unordered Data**: Sempre ordenar barras por valor (não alfabético)
- ⚠️ **Pie Charts**: Substituir por treemap/barplot
- ⚠️ **Area as Encoding**: Evitar. Usar posição/comprimento

---

### 2.3 DISTRIBUIÇÃO (Histogramas de P/L, EV/EBITDA, P/VP)

**Regra data-to-viz**: "One Numeric Variable" → Histogram, Density Plot

| Dado Backend | Recomendação |
|-------------|-------------|
| `price_distribution` (buckets com is_current/is_median) | **Histogram com marcadores** — barras para distribuição + linha vertical pontilhada para empresa atual + linha para mediana do setor |
| Score dos pilares (0-100 discreto) | **Lollipop Plot circular** ou **Radar/Spider** (único caso onde radar é aceitável: 5-7 dimensões do mesmo tipo) |

**Caveat**: Histogram bin size importa — usar os buckets que já vêm do backend (`bucket_index`)

---

### 2.4 SNOWFLAKE / RADAR (Scores Multidimensionais)

**Regra data-to-viz**: Spider/Radar Chart — "criticized in data visualization" mas aceitável com 5-7 variáveis da mesma escala

| Gráfico Atual | Avaliação | Recomendação |
|--------------|----------|-------------|
| Snowflake (radar 5 eixos) | ✅ Aceitável — 5 dimensões, mesma escala (0-100) | Manter como **identidade visual**, mas complementar com **Parallel Coordinates** ou **Small Multiples de barras** para leitura precisa |

**Caveat #29**: "Spider charts are difficult to read" — por isso o Snowflake deve ser acompanhado de valores numéricos explícitos (já implementado com ScoreBar)

---

### 2.5 COMPARAÇÃO TEMPORAL COM CATEGORIAS (Evolução por Pilar)

**Regra data-to-viz**: "One Categorical + Several Ordered Numeric" → Line Plot, Small Multiples

| Dado Backend | Recomendação |
|-------------|-------------|
| `pillar_chart_points` (valor por ano por pilar) | **Small Multiples** — um mini gráfico de linha por pilar, todos na mesma escala para fácil comparação |
| Score dos pilares ao longo dos runs | **Slope Chart** (antes/depois) ou **Bump Chart** (ranking ao longo do tempo) |

**Caveat #6 (Stacking Issues)**: NÃO empilhar scores de pilares. Cada pilar tem significado independente.

---

### 2.6 FLUXO E TIMELINE (Eventos Corporativos, Mudanças)

**Regra data-to-viz**: Network/Flow → Sankey para fluxos, Timeline para eventos

| Dado Backend | Recomendação |
|-------------|-------------|
| `timeline_events` (date, title, expected_impact) | **Timeline vertical** com ícones coloridos por impacto (positivo/negativo/neutro) |
| `changes` (before_after, severity) | **Diverging Lollipop** — eixo central = 0, variação positiva à direita, negativa à esquerda |
| `sources` (category, status, date) | **Heatmap de confiabilidade** — linhas = fontes, colunas = período, cor = status |

---

### 2.7 VALUATION ESPECÍFICO (Fair Value, Cenários, Sensibilidade)

| Dado Backend | Recomendação Otimizada |
|-------------|----------------------|
| `price_scenarios` (best/base/worst) | **Range Plot / Dumbbell Chart** — mostra faixa min-max com ponto do cenário base e marcador de preço atual |
| `price_ranges` (min, max, fair_value) | **Box Plot simplificado** (sem whiskers) — retângulo com mediana |
| `price_sensitivity_drivers` (driver, impact: high/medium/low) | **Horizontal Lollipop colorido** — ordenado por impacto, cor = severidade |
| Fair value vs Preço atual | **Bullet Chart** — muito mais efetivo que barra simples |

---

## 3. MAPEAMENTO FINAL: DADO BACKEND → GRÁFICO IDEAL

| # | Dado | Endpoint Backend | Gráfico Recomendado | Lib Recharts |
|---|------|-----------------|---------------------|-------------|
| 1 | Score Snowflake (5 pilares) | `GET /api/company-analysis/{ticker}` → pillar scores | **Radar Chart** (5 dims) + ScoreBar numérico | `RadarChart` |
| 2 | Evolução de preço | `price_chart` + `market_series` | **Area Chart com anotações** de timeline events | `AreaChart` + `ReferenceLine` |
| 3 | Fair value vs Preço | `price_context` + `price_cards` | **Bullet Chart** (custom) | `BarChart` customizado |
| 4 | Cenários de preço | `price_scenarios` + `price_ranges` | **Range/Dumbbell Chart** | `BarChart` com ErrorBar |
| 5 | Distribuição P/L, EV/EBITDA, P/VP | `price_distribution` (buckets) | **Histogram com marcadores** | `BarChart` + `ReferenceLine` |
| 6 | Empresa vs Setor vs Histórico | `market_snapshot` (current/sector/historical) | **Lollipop Plot horizontal** (3 pontos por métrica) | `BarChart` horizontal customizado |
| 7 | Evolução métricas pilar | `pillar_chart_points` (year_label, value) | **Small Multiples** (mini line charts) | `LineChart` em grid |
| 8 | Evidências | `pillar_evidences` (label, intensity, value) | **Diverging Lollipop** ou **Heatmap** | Custom com `BarChart` |
| 9 | Timeline eventos | `timeline_events` (date, title, impact) | **Timeline vertical** anotado | Custom HTML/CSS |
| 10 | Mudanças | `analysis_changes` (severity, before_after) | **Horizontal Lollipop divergente** | `BarChart` com ReferenceLine |
| 11 | Drivers de sensibilidade | `price_sensitivity_drivers` | **Horizontal Lollipop** colorido | `BarChart` horizontal |
| 12 | Composição acionária | (mock / futuro endpoint) | **Treemap** ou **Stacked Bar** | `Treemap` |
| 13 | Dashboard prioridades | `dashboard_copy_items` (priority_score) | **Heatmap** ou **Lollipop ordenado** | `BarChart` |
| 14 | Watchlist overview metrics | `watchlist_copy_page.quick_overview_metrics` | **KPI Cards** + **Sparklines** | Custom + `LineChart` mini |

---

## 4. ERROS A CORRIGIR NA IMPLEMENTAÇÃO ATUAL

| # | Erro | Caveat data-to-viz | Correção |
|---|------|-------------------|---------|
| 1 | Pie Chart para composição acionária | Caveat #4: Pie Charts | Trocar por **Treemap** ou **Horizontal Stacked Bar** |
| 2 | Gauge para PEG/ROE | Não recomendado (área como encoding) | Trocar por **Bullet Chart** |
| 3 | Barras para FCF projetado (10 anos) | Barras para série temporal esconde tendência | Adicionar **linha de tendência** sobre as barras |
| 4 | Sem anotações nos gráficos | Caveat #32: Missing Annotations | Adicionar labels de eventos do timeline sobre preço |
| 5 | Cores sem significado semântico consistente | Caveat #28: Inconsistent Colors | Padronizar: verde=bom, vermelho=ruim, cinza=neutro em TODOS os gráficos |
| 6 | Y-axis pode estar cortado em preço | Caveat #2: Y-Axis Cutting | Forçar `domain={[0, 'auto']}` ou deixar claro quando cortado |
| 7 | Labels verticais nos eixos | Caveat #19: Vertical Labels | Usar barras horizontais para categorias com nomes longos |

---

## 5. NOVOS GRÁFICOS A IMPLEMENTAR (do Backend para o Frontend)

### 5.1 Histogram de Distribuição de Múltiplos
**Fonte**: `company_analysis_price_distribution` (bucket_index, label, value, is_current, is_median)

```
Tipo: Histogram com 2 marcadores verticais
X: Faixa de valores (buckets)
Y: Frequência (quantidade de empresas)
Marcador 1: Linha pontilhada vermelha = valor da empresa
Marcador 2: Linha pontilhada azul = mediana do setor
```

### 5.2 Bullet Chart de Valuation
**Fonte**: `price_cards` (current_price, fair_value, gap_pct) + `price_ranges` (min, max)

```
Tipo: Bullet Chart horizontal
Fundo: Faixas cinza (pessimista → otimista)
Barra: Preço atual
Marcador: Fair value estimado
Label: Gap %
```

### 5.3 Timeline de Eventos
**Fonte**: `company_analysis_timeline_events` (event_date, title, source, expected_impact)

```
Tipo: Timeline vertical
Cada evento: Círculo colorido (impacto) + Data + Título + Descrição
Impacto positivo: Verde | Negativo: Vermelho | Neutro: Cinza
```

### 5.4 Heatmap de Saúde por Pilar
**Fonte**: `company_analysis_pillars` × `company_bundle_runs` (múltiplos runs)

```
Tipo: Heatmap
X: Data do run (trimestral)
Y: Pilar (7 linhas)
Cor: Score (verde 80+ | amarelo 60-80 | vermelho <60)
```

### 5.5 Diverging Chart de Mudanças
**Fonte**: `company_analysis_changes` (change_type, severity, impact, before_after)

```
Tipo: Diverging Horizontal Lollipop
Centro: 0 (sem mudança)
Direita: Impacto positivo (verde)
Esquerda: Impacto negativo (vermelho)
Tamanho do ponto: Severidade
```

### 5.6 Dumbbell Chart de Cenários
**Fonte**: `price_scenarios` (scenario_key, estimated_value, gap_vs_current_pct)

```
Tipo: Dumbbell/Range Plot
Uma linha por cenário (pessimista, base, otimista)
Ponto esquerdo: Preço atual
Ponto direito: Valor estimado
Cor: Verde (upside) / Vermelho (downside)
```

### 5.7 Sparklines para Watchlist
**Fonte**: `watchlist_copy_page.quick_overview_metrics`

```
Tipo: Mini Line Charts (50x20px)
Dentro de cada card de métrica no overview da watchlist
Sem eixos, sem labels — apenas a tendência visual
```

---

## 6. PRIORIDADE DE IMPLEMENTAÇÃO

| Prioridade | Gráfico | Impacto Visual | Complexidade |
|-----------|---------|---------------|-------------|
| 🔴 P0 | Bullet Chart (fair value) | Alto | Médio |
| 🔴 P0 | Histogram de distribuição (P/L) | Alto | Baixo |
| 🔴 P0 | Trocar Pie → Treemap | Alto | Baixo |
| 🟡 P1 | Timeline de eventos | Alto | Médio |
| 🟡 P1 | Dumbbell de cenários | Médio | Médio |
| 🟡 P1 | Diverging chart de mudanças | Médio | Médio |
| 🟡 P1 | Lollipop para comparativos | Médio | Baixo |
| 🟢 P2 | Heatmap de saúde temporal | Médio | Alto |
| 🟢 P2 | Small multiples por pilar | Médio | Médio |
| 🟢 P2 | Sparklines na watchlist | Baixo | Baixo |

---

## 7. REGRAS DE OURO (data-to-viz)

1. **Ordenar dados** — Nunca apresentar barras em ordem aleatória
2. **Evitar 3D** — Sempre flat/2D
3. **Cor = informação** — Não usar cor decorativa; cada cor deve representar uma variável
4. **Consistência** — Mesma cor = mesmo significado em todos os gráficos da página
5. **Anotar** — Highlight os pontos importantes com labels/setas
6. **Preferir posição/comprimento** — Encoding mais preciso que área/ângulo
7. **Small multiples > Spaghetti** — Quando comparar >3 séries
8. **Labels diretos** — Evitar legendas separadas quando possível (label na própria linha/barra)
