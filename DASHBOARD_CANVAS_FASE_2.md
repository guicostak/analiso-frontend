# Dashboard Canvas — Fase 2: Ilhas, Grid, DnD e Persistência

> Objetivo desta fase: transformar o `DashboardCanvas` (que na Fase 1 só
> mediava o markup atual) em um sistema de ilhas customizáveis funcional.
> Usuário consegue arrastar, reordenar e ver o layout persistir entre
> sessões. Catálogo, reset e tracking ficam para a Fase 3.

## Princípio
Substituição completa do markup "carregado" pelo canvas dirigido pelo
registry. As 17 ilhas implementadas reaproveitam markup existente
(seções de `DashboardPage` + 4 componentes-embrião do diretório
`features/dashboard/components/`).

---

## Entregáveis

### 1. Registry de ilhas (17 kinds)
Popular `IslandRegistry.ts` com metadados de cada kind:
- `component`, `label`, `description`, `icon`
- `baseSize: { w, h }` no grid de 12 colunas
- `computeSize(config)` (cresce vertical quando aplicável)
- `configSchema` (chaves permitidas em `IslandConfig`)
- `category`: `"core" | "acumulo" | "contexto" | "premium"`
- `requiresPlan?: "premium"`

| kind | baseSize | comportamento |
|---|---|---|
| `resumo_dia` | 12×2 | fixed |
| `prioridade_dia` | 4×2 | fixed |
| `maior_atencao` | 4×2 | fixed |
| `maior_melhora` | 4×2 | fixed |
| `watchlist_resumo` | 4×3 | fixed |
| `feed_mudancas` | 8×3 | fixed |
| `continue` | 4×1 | fixed |
| `empresas_recentes` | 4×2 | fixed (sempre 3 itens) |
| `buscas_recentes` | 4×2 | fixed (sempre 3 itens) |
| `comparacoes_recentes` | 4×2 | fixed (sempre 3 itens) |
| `agenda` | 4×2 | fixed |
| `alertas_recentes` | 3×1 | fixed |
| `sinais_watchlist` | 6×3 base | cresce: itemCount 3→h3, 5→h4, 10→h6 |
| `ciclo_mercado` | 3×1 | fixed |
| `heatmap_pilar` | 6×2 | fixed |
| `qualidade_dados` | 3×1 | fixed |
| `editorial_dia` | 12×1 | fixed |

### 2. Implementação das 17 ilhas
Em `src/features/dashboard-canvas/components/islands/`, uma por arquivo:

- `ResumoDoDiaIsland.tsx` — viés: Anchoring + Primacy
- `PrioridadeDoDiaIsland.tsx` — viés: Default Effect (CTA pré-selecionado)
- `MaiorAtencaoIsland.tsx` — viés: Loss Aversion (sem cor gritante)
- `MaiorMelhoraIsland.tsx`
- `WatchlistResumoIsland.tsx`
- `FeedMudancasIsland.tsx`
- `ContinueIsland.tsx` — viés: Zeigarnik
- `EmpresasRecentesIsland.tsx` — viés: Sunk Cost + IKEA Effect
- `BuscasRecentesIsland.tsx`
- `ComparacoesRecentesIsland.tsx`
- `AgendaIsland.tsx`
- `AlertasRecentesIsland.tsx`
- `SinaisWatchlistIsland.tsx` — viés: Confidence Building (toda linha tem fonte)
- `CicloMercadoIsland.tsx`
- `HeatmapPilarIsland.tsx`
- `QualidadeDadosIsland.tsx`
- `EditorialDoDiaIsland.tsx`

**Cada ilha** deve ter no mínimo 1 comentário JSX anotando o viés principal.

**Reaproveitamento:** mover (não duplicar) markup das 4 "ilhas-embrião" em
`src/features/dashboard/components/`:
- `right-rail.tsx` → 4 ilhas (Atenção/Alertas/Qualidade/Atalhos)
- `changes-feed-card.tsx` → `FeedMudancasIsland`
- `heatmap-mudancas-card.tsx` → `HeatmapPilarIsland`
- `quick-action-cards.tsx` → fonte do `EditorialDoDiaIsland`

### 3. Hook de dados das ilhas
`useIslandData.ts` — genérico, recebe `kind` e devolve dado tipado.
Internamente delega para hooks da feature original (`useWatchlist`,
`useAgenda`, `useNotifications`, `useDashboardSummary` etc.).

**Regra crítica:** zero duplicação de fetch. Ilhas que dependem do
`dashboardData` recebem por props. Ilhas com fonte própria
(`empresas_recentes`, `sinais_watchlist`, `comparacoes_recentes`, `agenda`)
fetcham via seus services próprios — **lazy** via `useInViewLazyFetch`.

### 4. CanvasGrid (DnD)
`CanvasGrid.tsx`:
- `DndContext` + `closestCenter` collision detection
- `SortableContext` com `rectSortingStrategy`
- Cada `IslandFrame` é `useSortable`
- Snap em colunas inteiras (grid 12 cols + gap configurável)
- `KeyboardSensor` habilitado para acessibilidade
- Drag handle visível **só em modo edição** (handle pontilhado)

### 5. IslandFrame
`IslandFrame.tsx` — shell de cada ilha:
- Drag handle (hover)
- Borda pontilhada em modo edição
- Botão × (remover) com confirmação inline em **amber** — Loss Aversion,
  nunca red gritante
- Botão ⚙ (config) abre popover com opções (ex.: `itemCount`)
- Aplica `baseSize` do registry via `grid-column` + `grid-row`

### 6. Modo edição
- `EditModeToggle.tsx` no topo do canvas (não no menu hamburger).
  Texto: "Personalizar painel" / "Concluir personalização".
- `useEditMode.ts` — toggle global (Context ou Zustand-like leve).
- Em modo edição: resto do app fica `opacity: 0.5` e `pointer-events: none`
  fora do canvas.

### 7. Persistência
`useDashboardLayout.ts`:
- mount: `GET /api/me/dashboard-layout`
- 404 ou layout vazio: usa `defaultLayout` local + dispara `PUT` imediato
  (cria endowment desde o login — Sunk Cost)
- mudanças locais (drag, config) → setState otimista + debounced `PUT` (1s)
- cache otimista em `localStorage` (chave: `analiso:dashboard-layout:v1`)
  como fallback offline, **NUNCA** como source of truth
- expõe `resetLayout()` para a Fase 3

### 8. Mobile fallback
`MobileFallbackBanner.tsx` + lógica em `CanvasGrid`:
- `< xl breakpoint (1280px)`: renderiza ilhas em coluna única, ordem do layout
- `DndContext` **NÃO** inicializado
- Banner topo: "Personalize seu painel pelo Desktop ou pelo app Analiso"
  com 2 CTAs (não link genérico)

---

## Restrições
- Zero hardcoded de cor/spacing/typography.
- Zero `any`.
- Zero chamadas HTTP em componentes.
- Dark mode automático via tokens.
- Reaproveitar componentes shadcn/ui já instalados (Card, Button, Badge,
  Skeleton, Popover, Tooltip).
- Zero alteração em features fora do escopo (ver Fase 1).
- Zero alteração em `src/data/dashboard-feed`.
- Cada ilha deve ter comentário JSX anotando o viés principal.

---

## Critérios de aceite
- [ ] `npm run build` passa sem erros.
- [ ] `/painel` renderiza canvas com default layout para usuário sem layout salvo.
- [ ] As 17 ilhas existem e renderizam com dados (mock ou real).
- [ ] Modo edição habilita drag de ilhas.
- [ ] Reordenar persiste após reload (via `PUT /api/me/dashboard-layout`).
- [ ] Remover ilha pede confirmação amber e persiste.
- [ ] Mobile (`< 1280px`) mostra stack vertical + banner CTA.
- [ ] Dark mode automático em todas as ilhas.
- [ ] Cada arquivo de ilha contém ao menos 1 comentário JSX de viés.

---

## Commit final da fase
```
feat(dashboard-canvas): fase 2 — 17 ilhas, grid DnD e persistência
```
