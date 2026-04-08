# Dashboard Canvas — Fase 3: Catálogo, Reset, Tracking e Polish

> Objetivo desta fase: fechar o ciclo de customização. Usuário consegue
> adicionar ilhas pelo catálogo, restaurar o padrão com confirmação, e o
> sistema captura as visitas a empresas e comparações para alimentar as
> ilhas de "acúmulo" (Sunk Cost).

## Princípio
Fase 1 = fundação. Fase 2 = canvas funcional. Fase 3 = ciclo completo
de customização + alimentação de dados + integração com `AppTopBar`.

---

## Entregáveis

### 1. AddIslandSheet (catálogo)
`AddIslandSheet.tsx` — Drawer (vaul, lateral direita no desktop) com
`Command` (cmdk) searchable.

- Categorias: **Core / Acúmulo / Contexto / Premium**
- Cada item:
  - icon, label, description curta
  - badge de categoria
  - se `requiresPlan === "premium"` e `!isPaid`: badge "Pro"
    (não bloquear add no v1 — só sinalizar visualmente; backend é o gate real)
  - se já está no layout: marcador "Adicionada"
- Click → adiciona ao layout no primeiro slot livre
  (algoritmo top-to-bottom, left-to-right no grid 12 colunas)

Botão "+ Adicionar ilha" no canto inferior direito do canvas (visível só
em modo edição) abre o sheet.

### 2. ResetLayoutDialog
`ResetLayoutDialog.tsx` — confirmação **Loss Aversion** com tom amber.

- Título: "Voltar ao painel padrão?"
- Body: "Você vai perder seu layout atual e a configuração de cada ilha."
- Botão primário: "Sim, restaurar"
- Botão secundário: "Cancelar"
- Tom: **amber**, NUNCA red gritante

Acionado pelo botão "Restaurar padrão" no topo direito do canvas
(visível só em modo edição).

Internamente chama `useDashboardLayout().resetLayout()` →
`DELETE /api/me/dashboard-layout` + estado local volta ao `defaultLayout`.

### 3. EditModeToggle no AppTopBar
Editar `AppTopBar`:
- Adicionar `EditModeToggle` (não no menu hamburger — descoberta importa).
- Texto: "Personalizar painel" / "Concluir personalização"
- Visível apenas na rota `/painel`.

> Esta é a única alteração no `AppTopBar`. Nada além disso.

### 4. Tracking de empresas recentes
Editar `src/features/empresa/components/CompanyAnalysisPage.tsx` (ou onde
a rota `/empresa/[ticker]` monta):
- No `useEffect` de mount, chamar
  `recentCompaniesService.trackVisit(ticker)` fire-and-forget.
- Não bloquear renderização. Não logar erro visualmente.

### 5. Tracking de comparações
Editar `src/features/compare/hooks/useCompare.ts`:
- Após uma comparação ser buscada com sucesso, chamar
  `compareHistoryService.track(tickerA, tickerB)` fire-and-forget.

### 6. Polish final das ilhas
- Revisar comentários de viés em todas as 17 ilhas.
- Verificar checklist de dark mode em cada ilha (architecture_skill).
- Garantir skeletons via `bg-muted animate-pulse` (sem hex).
- Loss Aversion: nenhuma confirmação destrutiva em red — todas amber.

---

## Restrições
- A única alteração permitida em `AppTopBar` é adicionar o `EditModeToggle`.
- A única alteração permitida em `CompanyAnalysisPage` é a chamada
  `trackVisit` fire-and-forget.
- A única alteração permitida em `useCompare` é a chamada `track`
  fire-and-forget.
- Zero alteração em `Sidebar`, `MainContent`, `ProtectedRoute`,
  `features/agenda`, `features/watchlist`, `features/notifications`,
  `features/search-history`, `features/analysis`.
- Zero alteração em `src/data/dashboard-feed`.
- Zero hardcoded, zero `any`, zero HTTP em componentes.

---

## Critérios de aceite
- [ ] `npm run build` passa sem erros.
- [ ] Adicionar ilha pelo catálogo persiste após reload.
- [ ] Catálogo mostra badge "Pro" em ilhas premium para usuário free.
- [ ] Catálogo marca ilhas já presentes no layout como "Adicionada".
- [ ] "Restaurar padrão" abre dialog amber e reseta layout.
- [ ] `EditModeToggle` aparece no `AppTopBar` apenas em `/painel`.
- [ ] Visitar `/empresa/VALE3` popula `EmpresasRecentesIsland` após reload.
- [ ] Rodar uma comparação popula `ComparacoesRecentesIsland` após reload.
- [ ] Todas as 17 ilhas têm comentário JSX de viés.
- [ ] Dark mode 100% via tokens semânticos.

---

## Entregas finais
Ao terminar a Fase 3, imprimir no terminal:
- Lista de arquivos criados (paths absolutos)
- Lista de arquivos modificados
- Resultado de `npm run build`
- TL;DR de 15 linhas + screenshots dos estados:
  - default
  - edit mode
  - catálogo aberto
  - reset dialog

## Commit final da fase
```
feat(dashboard-canvas): fase 3 — catálogo, reset, tracking e polish
```
