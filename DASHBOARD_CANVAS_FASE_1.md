# Dashboard Canvas — Fase 1: Fundação

> Objetivo desta fase: preparar o terreno arquitetural para o canvas de ilhas
> sem ainda introduzir DnD, persistência completa ou implementação das 17
> ilhas. Ao final da fase, `npm run build` passa, `/painel` continua funcional
> exatamente como hoje, e o `DashboardCanvas` já é o ponto de entrada do
> estado "carregado" — apenas renderizando placeholders por enquanto.

## Princípio
Não quebrar nada. Refactor preparatório + esqueleto da nova feature.
Zero impacto visual perceptível para o usuário.

---

## Entregáveis

### 1. Dependências
Adicionar ao `package.json`:
- `@dnd-kit/core` (^6.x)
- `@dnd-kit/sortable` (^9.x)
- `@dnd-kit/utilities` (^3.x)

Justificar no commit: leve, acessível por teclado, compatível React 19.
**Não usar ainda nesta fase** — apenas instalar para desbloquear a Fase 2.

### 2. Refactor de `useDashboardInbox`
Quebrar em 4 sub-hooks **no mesmo arquivo de origem**, exportando-os
adicionalmente. `useDashboardInbox` continua existindo e re-exporta tudo
para manter compatibilidade.

- `useDashboardSummary` → `headline`, `body`, `tone`, `refresh`, `refError`,
  `dashboardData`, `priorityItem`, `topRiskItem`, `topImproveItem`
- `useInbox` → `inboxRows`, `inboxFilters`, `inboxMode`, `openInboxItem`,
  `setInboxFilters`, `clearInboxFilters`, `refreshInboxNow`, `viewedInboxItemIds`,
  `newBadgeUntil`, `inboxRef`, `filtersOpen`, `activeSeverities/Pillars/Sources`,
  `focusInboxRecentImpact`
- `usePillarMovements` → `leadingPillarMovement`, `visiblePillarMovements`,
  `pillarInsight`, `applySinglePillarFilter`, `focusedPillar`
- `useReadingProgress` → `viewedInboxItemIds`, `progressStates`,
  `currentProgressStep`, `completedSteps`, `progressHeadlineStep`

**Regra:** zero mudança de lógica. Só recortes. `DashboardPage` continua
chamando `useDashboardInbox()` sem perceber a quebra.

### 3. Hooks globais novos
- `src/hooks/usePersistedState.ts` — `useLocalStorageState<T>(key, initial)`,
  SSR-safe (lê só no `useEffect`).
- `src/hooks/useInViewLazyFetch.ts` — recebe ref + fetcher, dispara UMA VEZ
  via `IntersectionObserver` (threshold 0.1).

### 4. Esqueleto da feature `dashboard-canvas`
Criar a estrutura de pastas e arquivos vazios/stubs em
`src/features/dashboard-canvas/`:

```
src/features/dashboard-canvas/
  components/
    DashboardCanvas.tsx              ← stub: renderiza children atuais como fallback
  registry/
    IslandRegistry.ts                ← Map vazio (será populado na Fase 2)
  hooks/
    useDashboardLayout.ts            ← stub que devolve defaultLayout (sem fetch)
  interfaces/
    layout.types.ts                  ← LayoutItem, IslandKind, IslandConfig, DashboardLayout
    island.types.ts                  ← IslandMeta, IslandProps, IslandSize
  services/
    dashboard-layout.service.ts      ← stub com getLayout/putLayout/resetLayout
    recent-companies.service.ts      ← stub com getRecent/trackVisit
    compare-history.service.ts       ← stub com getHistory/track/deleteEntry
    watchlist-signals.service.ts     ← stub com getSignals
  mappers/
    layout.mapper.ts                 ← DTO ↔ LayoutItem
  defaults/
    defaultLayout.ts                 ← layout default consolidado (constante)
```

### 5. Integração mínima no `/painel`
Editar `src/features/dashboard/components/DashboardPage.tsx`:

- **Manter** `isProcessing` (animação pipeline) intacto.
- **Manter** `isEmpty` (3 action cards) intacto.
- **Substituir** o bloco "carregado" (linhas ~553 em diante) por
  `<DashboardCanvas {...allProps} />`.
- O `DashboardCanvas` desta fase **renderiza exatamente o markup atual**
  como filhos compostos — só está mediando. Visualmente, nada muda.

> A ideia é que ao mergear a Fase 1, o usuário não note diferença, mas a
> Fase 2 já consiga substituir o conteúdo de `DashboardCanvas` sem mexer
> em mais nada.

---

## Restrições
- Zero quebra de build (`npm run build` deve passar limpo).
- Zero mudança visual em `/painel`.
- Zero hardcoded de cor/spacing/typography.
- Zero `any`.
- Zero chamadas HTTP em componentes.
- Zero alteração em `src/data/dashboard-feed`, `features/agenda`, `features/watchlist`,
  `features/compare`, `features/notifications`, `features/search-history`,
  `features/analysis`, `features/empresa`, `AppTopBar`, `Sidebar`, `MainContent`,
  `ProtectedRoute`.

---

## Critérios de aceite
- [ ] `npm install` adiciona as 3 deps de `@dnd-kit/*` sem warning crítico.
- [ ] `npm run build` passa sem erros nem warnings de TypeScript.
- [ ] `/painel` em modo `isProcessing` continua igual.
- [ ] `/painel` em modo `isEmpty` continua igual (3 action cards).
- [ ] `/painel` em modo "carregado" continua visualmente idêntico.
- [ ] `useDashboardInbox()` retorna o mesmo shape de antes.
- [ ] Os 4 sub-hooks são exportados e podem ser importados isoladamente.
- [ ] `usePersistedState` e `useInViewLazyFetch` existem em `src/hooks/`.
- [ ] Estrutura `src/features/dashboard-canvas/` criada conforme especificação.

---

## Commit final da fase
```
feat(dashboard-canvas): fase 1 — fundação (hooks, esqueleto, deps)
```
