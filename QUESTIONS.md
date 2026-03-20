# QUESTIONS.md — Auditoria de Arquitetura Frontend
> Foco: Separação de Pages e Components

---

## Project Understanding Summary

**Analiso-Frontend** é uma plataforma de análise financeira Next.js 15 (App Router) voltada para investidores brasileiros. O stack inclui React 19, TypeScript strict, Tailwind CSS v4, Radix UI + shadcn/ui, React Context API para estado global, e hooks customizados por feature.

**Estrutura atual em resumo:**
- Rotas definidas em `/app` (App Router do Next.js)
- Todos os componentes vivem em `src/components/` sem separação clara de página vs. reutilizável
- 5 componentes de página são monolíticos (753–1173 linhas cada)
- Sub-pastas existem apenas para `dashboard/` e `landing/` — demais features são planas
- Nenhuma estratégia de Server Components; tudo é `"use client"`

**Áreas de maior risco identificadas:**
1. Ausência de fronteira clara entre page-level e reusable components
2. Componentes de página misturados com componentes reutilizáveis na raiz de `src/components/`
3. Lógica de layout (sidebar, top-bar) sem local definitivo
4. Componentes críticos com 939–1173 linhas sem decomposição

---

## How to Answer

Para cada questão abaixo, responda diretamente e classifique com uma das tags:

| Tag | Significado |
|-----|-------------|
| `verified` | Comportamento intencional, pode avançar |
| `partial` | Parcialmente decidido, precisa de detalhamento |
| `blocked` | Bloqueado por dependência externa |
| `deferred` | Decidido para depois, não urgente |
| `out-of-scope` | Fora do escopo atual |
| `caveat` | Verdadeiro com ressalvas importantes |

---

## Questions

---

### 1. Estrutura de Diretórios — Separação Pages vs. Components

#### Q1. Onde devem viver os componentes que são exclusivos de uma página?
- **Onde:** `src/components/dashboard.tsx`, `src/components/explore.tsx`, `src/components/compare-page.tsx`, `src/components/watchlist.tsx`, `src/components/company-analysis.tsx`
- **Por que importa:** Esses arquivos são containers de página (smart components) mas estão na mesma pasta que componentes reutilizáveis como `error-state.tsx` e `loading-state.tsx`. Isso torna difícil entender o que pode ser reaproveitado e o que é específico de uma rota.
- **Questão:** Você prefere mover esses containers para dentro de `src/features/<nome>/` ou para `src/pages/` (espelhando as rotas do `app/`)? Ou a preferência é manter tudo em `src/components/` mas com sub-pastas por feature?
- **Resposta:** `verified` — Manter tudo em `src/components/` com sub-pastas por feature.

#### Q2. O diretório `app/` deve conter apenas arquivos de rota (page.tsx, layout.tsx) ou também lógica?
- **Onde:** `app/dashboard/page.tsx`, `app/empresa/[ticker]/page.tsx`, etc.
- **Por que importa:** Atualmente os `page.tsx` apenas renderizam um componente importado de `src/components/`. Essa é uma boa prática, mas precisa ser consistente — alguns pages podem eventualmente ter metadata, loading states e error boundaries próprios.
- **Questão:** O padrão desejado é `app/*/page.tsx` sendo apenas um shell fino (import + export), com toda a lógica dentro de `src/`? Ou alguns `page.tsx` podem ter mais responsabilidade?
- **Resposta:** `verified` — Manter `app/*/page.tsx` como shells finos. Sem mudança de abstração por enquanto.

#### Q3. Qual deve ser a estrutura canônica de pastas em `src/components/`?
- **Onde:** `src/components/` (raiz com 26 arquivos flat + sub-pastas inconsistentes)
- **Por que importa:** Atualmente temos `dashboard/` com sub-componentes organizados, `landing/` organizado, mas `compare`, `explore`, `watchlist` sem sub-pastas. Isso cria inconsistência e dificulta onboarding de novos devs.
- **Questão:** Qual das opções abaixo melhor reflete sua visão?
  - **Opção A — Por Feature:** `src/components/{feature}/` (dashboard/, explore/, compare/, watchlist/, empresa/, auth/, landing/)
  - **Opção B — Por Tipo:** `src/components/{pages|shared|ui|layout}/`
  - **Opção C — Híbrida:** `src/features/{feature}/{components,hooks,types}/` + `src/components/` só para shared
- **Resposta:** `verified` — Opção A: por feature dentro de `src/components/`.

#### Q4. `src/components/ui/` deve permanecer como está?
- **Onde:** `src/components/ui/` (50+ arquivos Radix/shadcn)
- **Por que importa:** Esses são primitivos de UI sem lógica de negócio — são claramente separados e funcionam bem onde estão.
- **Questão:** Esse diretório fica fora da reorganização? Ou deve ser movido para `src/ui/` para maior clareza hierárquica?
- **Resposta:** `verified` — Manter `src/components/ui/` como está, fora da reorganização.

---

### 2. Componentes de Página — Decomposição

#### Q5. Os componentes de página monolíticos devem ser decompostos?
- **Onde:** `compare-page.tsx` (1173 linhas), `company-analysis.tsx` (939 linhas), `watchlist.tsx` (939 linhas), `explore.tsx` (858 linhas), `dashboard.tsx` (753 linhas)
- **Por que importa:** Arquivos com mais de 700 linhas misturam JSX de layout, lógica condicional, e sub-renderizações inline. Isso dificulta code review, testes unitários e reaproveitamento de partes.
- **Questão:** Para cada um desses, você aprova criar sub-componentes explícitos (ex: `CompareHeader`, `CompareTableRow`, `ComparePillarChart`) dentro de uma pasta `compare/`?
- **Resposta:** `verified` — Sim, criar sub-componentes para todas as páginas monolíticas.

#### Q6. Qual é o critério para extrair um sub-componente dentro de uma page?
- **Onde:** Qualquer page container
- **Por que importa:** Sem critério claro, a decomposição pode ser arbitrária. Critérios comuns: reutilização, tamanho (>80 linhas), responsabilidade única, testabilidade.
- **Questão:** Qual critério adotar? (a) somente se o componente for reutilizado em outra página, (b) se tiver mais de N linhas, (c) se tiver lógica de estado própria, (d) sempre que representar uma seção visual distinta?
- **Resposta:** `verified` — Critério D: sempre que representar uma seção visual distinta.

---

### 3. Layout e Componentes de Shell

#### Q7. A Sidebar e o TopBar são globais ou específicos de cada feature?
- **Onde:** `src/components/dashboard/sidebar.tsx`, `src/components/dashboard/top-bar.tsx`, `src/components/app-top-bar.tsx`
- **Por que importa:** Existem dois top bars: um em `app-top-bar.tsx` (provavelmente global) e outro em `dashboard/top-bar.tsx` (específico). A sidebar está em `dashboard/` mas provavelmente é usada também em explore, compare e watchlist. Se for compartilhada, deve sair de `dashboard/`.
- **Questão:** Qual é o escopo real de cada componente de layout? A sidebar e o top bar do dashboard são reutilizados em outras páginas autenticadas, ou cada página terá seu próprio layout?

#### Q8. Deve existir um layout compartilhado para páginas autenticadas?
- **Onde:** `app/layout.tsx`, `app/(marketing)/layout.tsx`
- **Por que importa:** Atualmente há apenas dois layouts: root e marketing. Páginas protegidas (dashboard, watchlist, explore, compare, empresa) provavelmente compartilham sidebar + top-bar. Se cada page monta esses elementos individualmente, qualquer mudança de layout exige editar múltiplos arquivos.
- **Questão:** Deve ser criado um `app/(authenticated)/layout.tsx` que inclui sidebar e top-bar, aplicado a todas as páginas protegidas?

#### Q9. O `ProtectedRoute.tsx` deve ser substituído por middleware ou layout?
- **Onde:** `src/components/ProtectedRoute.tsx`
- **Por que importa:** No Next.js App Router, a proteção de rotas pode ser feita via `middleware.ts` (server-side, sem flash de conteúdo) ou via layout com verificação de sessão. O HOC `ProtectedRoute` é um padrão React Pages Router que pode causar flash de conteúdo não autenticado.
- **Questão:** A proteção de rotas deve migrar para `middleware.ts` ou para um layout autenticado, ou o `ProtectedRoute` HOC atual é suficiente por ora?

---

### 4. Hooks e Serviços

#### Q10. Os hooks de feature devem ficar em `src/hooks/` global ou dentro da pasta da feature?
- **Onde:** `src/hooks/useDashboardInbox.ts`, `useExplore.ts`, `useCompare.ts`, `useWatchlist.ts`, `useHeatmapMudancas.ts`, `useOnboarding.ts`
- **Por que importa:** Todos os hooks atuais são específicos de uma feature — nenhum é realmente compartilhado. Colocá-los em `src/hooks/` global sugere que são utilitários genéricos, quando na verdade são parte do domínio de uma feature.
- **Questão:** Hooks de feature devem ficar em `src/features/<feature>/hooks/` (colocation), ou a preferência é manter `src/hooks/` como diretório único para todos os hooks?

#### Q11. Os serviços de API devem ser colocados junto à feature ou em `src/services/` global?
- **Onde:** `src/services/dashboard.ts`, `explore.ts`, `company.ts`, `compare.ts`, `watchlist.ts`, `onboarding.ts`
- **Por que importa:** Assim como os hooks, cada serviço é responsável por uma feature específica. A separação por feature facilitaria encontrar tudo relacionado a uma funcionalidade no mesmo lugar.
- **Questão:** Os serviços ficam em `src/services/` global (padrão atual) ou migram para colocation em `src/features/<feature>/`?

#### Q12. Os tipos por feature devem ser colocados junto à feature?
- **Onde:** `src/types/dashboard.ts`, `compare.ts`, `explore.ts`, `watchlist.ts`, `company.ts`, `onboarding.ts`
- **Por que importa:** Mesma questão de colocation — tipos específicos de feature no mesmo diretório da feature ou centralizados.
- **Questão:** Centralizar em `src/types/` (padrão atual) ou colocar dentro de cada feature?

---

### 5. Nomenclatura e Convenções

#### Q13. Qual é a convenção de nome para componentes de página vs. componentes reutilizáveis?
- **Onde:** Todo `src/components/`
- **Por que importa:** Atualmente mistura PascalCase com sufixo "Page" (`compare-page.tsx`, `demo-page.tsx`), PascalCase sem sufixo (`company-analysis.tsx`), e kebab-case para utilitários (`error-state.tsx`). Não há convenção consistente.
- **Questão:** Qual convenção adotar?
  - Page containers: `{Feature}Page.tsx`?
  - Componentes reutilizáveis: PascalCase simples?
  - Arquivos: kebab-case sempre?

#### Q14. A pasta `src/components/figma/` e `src/components/adsense/` devem permanecer onde estão?
- **Onde:** `src/components/figma/ImageWithFallback.tsx`, `src/components/adsense/AdsenseDashboardTop.tsx`
- **Por que importa:** `ImageWithFallback` parece um utilitário genérico, não específico de Figma. `AdsenseDashboardTop` é específico de uma feature (dashboard). A nomenclatura da pasta pode ser enganosa.
- **Questão:** Esses componentes devem ser movidos? `ImageWithFallback` para `src/components/shared/` ou `src/components/ui/`, e `AdsenseDashboardTop` para dentro da pasta do dashboard?

---

### 6. Dados Estáticos e Mocks

#### Q15. Os arquivos em `src/data/` são temporários (desenvolvimento) ou permanentes (prod)?
- **Onde:** `src/data/mock-companies.ts`, `company-detail.ts`, `dashboard-feed.ts`, `landing.ts`, `glossary.ts`
- **Por que importa:** Se os mocks são apenas para desenvolvimento, devem estar atrás de uma flag ou em pasta separada (`__mocks__`). Se são conteúdo estático permanente (ex: `landing.ts`, `glossary.ts`), devem ficar em `src/data/` mas separados dos mocks de desenvolvimento.
- **Questão:** Quais arquivos em `src/data/` são dados permanentes de produção e quais são apenas mocks de desenvolvimento?

#### Q16. O dado de `compare.ts` (pillar copy data) deve ficar no serviço ou em `src/data/`?
- **Onde:** `src/services/compare.ts` contém dados estáticos de cópia de pilares
- **Por que importa:** Dados estáticos dentro de um arquivo de serviço mistura responsabilidades — serviços devem ser responsáveis por I/O, não por conteúdo estático.
- **Questão:** Esses dados de cópia devem ser movidos para `src/data/` ou para um arquivo de constantes dentro da feature de comparação?

---

### 7. Server Components vs. Client Components

#### Q17. Existe intenção de usar Server Components em alguma parte?
- **Onde:** Todos os arquivos com `"use client"` no topo
- **Por que importa:** Next.js App Router favorece Server Components por padrão para melhor performance (sem hidratação, bundle menor, streaming). Atualmente tudo é client component. Páginas como `explorar` e `empresa/[ticker]` poderiam ter data fetching server-side.
- **Questão:** Há plano de migrar qualquer parte para Server Components? Quais rotas seriam candidatas (explore, empresa/[ticker])?

#### Q18. O `app/providers.tsx` deve permanecer client-side?
- **Onde:** `app/providers.tsx` (ThemeProvider, AuthContext, GoogleOAuthProvider, GlossaryProvider)
- **Por que importa:** Em Next.js App Router, providers de contexto precisam ser client components — isso é correto. O padrão está bom, mas a composição pode ser melhorada.
- **Questão:** O arquivo `providers.tsx` deve ser responsabilidade de quem no novo design? Ele fica no `app/` ou move para `src/`?

---

### 8. Questões de Segurança e Autenticação

#### Q19. O token JWT armazenado em localStorage é intencional?
- **Onde:** `src/contexts/AuthContext.tsx` — `localStorage.setItem("analiso_token", ...)`
- **Por que importa:** localStorage é vulnerável a ataques XSS. O padrão mais seguro é usar `httpOnly` cookies para tokens de autenticação.
- **Questão:** Essa é uma decisão consciente de arquitetura (aceitar risco XSS por simplicidade) ou há planos de migrar para cookies httpOnly?

#### Q20. Rotas como `/explorar`, `/comparar` e `/empresa/[ticker]` são públicas intencionalmente?
- **Onde:** `app/explorar/page.tsx`, `app/comparar/page.tsx`, `app/empresa/[ticker]/page.tsx`
- **Por que importa:** Essas rotas não têm `ProtectedRoute`. Se contêm dados premium ou personalizados, podem expor informações indevidas a usuários não autenticados.
- **Questão:** Essas rotas são intencionalmente públicas (freemium), ou deveriam exigir autenticação?

---

### 9. Performance e Bundle

#### Q21. Há estratégia de code splitting por route?
- **Onde:** Todo o `app/`
- **Por que importa:** Next.js App Router já faz code splitting automático por rota, mas imports de componentes grandes no nível do page podem trazer bundles desnecessários.
- **Questão:** Há componentes que deveriam ser `dynamic(() => import(...))` com lazy loading (ex: charts, `compare-page.tsx`)?

#### Q22. Os 50+ componentes shadcn/ui são todos utilizados?
- **Onde:** `src/components/ui/`
- **Por que importa:** Componentes shadcn são copiados para o projeto (não são dependências npm), então dead code aqui aumenta o bundle diretamente.
- **Questão:** Existe algum processo para auditar quais componentes de `ui/` são realmente usados?

---

### 10. Testes

#### Q23. Existe estratégia de testes definida?
- **Onde:** Nenhum arquivo de teste encontrado no repositório
- **Por que importa:** Zero cobertura de testes significa que qualquer refatoração de arquitetura (como a reorganização pages/components) não tem rede de segurança.
- **Questão:** Antes ou durante a reorganização, há plano de adicionar testes? Se sim, qual framework (Vitest, Jest, Playwright)?

#### Q24. Os hooks customizados são testáveis de forma isolada?
- **Onde:** `src/hooks/useDashboardInbox.ts` (~400 linhas), `useExplore.ts`, etc.
- **Por que importa:** Hooks com lógica de negócio densa (`useDashboardInbox` tem ~400 linhas) são os candidatos mais importantes para testes unitários, mas só funcionam se forem independentes de DOM.
- **Questão:** Esses hooks têm dependências de DOM ou de contextos React que dificultariam testes com `renderHook`?

---

### 11. Decisões de Design Abertas

#### Q25. Qual é a estrutura final desejada para `src/`?

Esta é a questão-síntese. Com base nas respostas anteriores, uma das estruturas abaixo:

**Opção A — Feature-First (colocation máxima):**
```
src/
├── features/
│   ├── dashboard/
│   │   ├── components/  (sidebar, top-bar, cards)
│   │   ├── hooks/       (useDashboardInbox)
│   │   ├── services/    (dashboard.ts)
│   │   ├── types/       (dashboard.ts)
│   │   └── DashboardPage.tsx
│   ├── explore/
│   ├── compare/
│   ├── watchlist/
│   ├── empresa/
│   ├── auth/
│   └── landing/
├── components/
│   ├── ui/              (shadcn primitives)
│   └── shared/          (error-state, loading-state, etc.)
├── contexts/            (AuthContext, GlossaryContext)
├── data/                (glossary, landing static data)
└── styles/
```

**Opção B — Layer-First (separação por tipo):**
```
src/
├── components/
│   ├── ui/              (shadcn primitives)
│   ├── pages/           (DashboardPage, ComparePage, etc.)
│   ├── layouts/         (sidebar, top-bar, shells)
│   └── shared/          (error-state, loading-state, charts)
├── hooks/               (todos os hooks)
├── services/            (todos os serviços)
├── types/               (todos os tipos)
├── contexts/
├── data/
└── styles/
```

**Opção C — Híbrida (mínima disrupção):**
```
src/
├── components/
│   ├── ui/              (shadcn primitives)
│   ├── dashboard/       (DashboardPage + sub-components)
│   ├── explore/         (ExplorePage + sub-components)
│   ├── compare/         (ComparePage + sub-components)
│   ├── watchlist/       (WatchlistPage + sub-components)
│   ├── empresa/         (CompanyAnalysisPage + sub-components)
│   ├── auth/            (mantém como está)
│   ├── landing/         (mantém como está)
│   └── shared/          (error-state, loading-state, charts, ProtectedRoute)
├── hooks/               (mantém como está)
├── services/            (mantém como está)
├── types/               (mantém como está)
├── contexts/
├── data/
└── styles/
```

- **Questão:** Qual opção (ou variação) melhor representa sua visão para o projeto?

---

## Suggested answer tags

Use estas tags ao responder:
- `verified` — comportamento intencional, pode implementar
- `partial` — parcialmente decidido, precisa de detalhamento
- `blocked` — bloqueado por dependência externa
- `deferred` — para depois, não urgente agora
- `out-of-scope` — fora do escopo atual
- `caveat` — verdadeiro com ressalvas importantes

---

## Next Step

Após responder as questões, a próxima fase é a implementação guiada pela skill `questions-md-resolution-implementation`.

**Questões prioritárias para responder antes de qualquer implementação:**
- **Q1** — Onde vivem os containers de página?
- **Q3** — Qual estrutura canônica para `src/components/`?
- **Q7** — Sidebar e TopBar são globais ou por feature?
- **Q8** — Deve existir layout de rotas autenticadas?
- **Q25** — Qual opção de estrutura final?
