# SEO — Onda 4: Longo prazo

## Pré-requisito

Ondas 1, 2 e 3 concluídas. Especialmente: `/empresas/[ticker]` já público (Onda 2) e dados de empresa acessíveis sem auth.

## Contexto

Esta onda escala SEO programático e resolve dívidas técnicas. **Nenhuma tarefa aqui deve ser feita sem decisão de negócio explícita** — várias dependem de definição de pricing público, escolha de autor, etc.

## Objetivo

1. Programmatic: páginas de comparação `/empresas/comparar/[a]-vs-[b]`.
2. Programmatic: glossário `/glossario/[termo]`.
3. Página `/precos` pública.
4. Publicar `pricing.md` para AI agents.
5. Resolver `next.config.ts` `ignoreBuildErrors`.
6. Auditoria de imagens marketing com `next/image`.
7. Off-site: presence (G2/Capterra, Reddit, YouTube).

## Regras de execução

- **Cada tarefa programática exige checklist Helpful Content** — não gerar páginas sem dado único, não duplicar texto entre páginas.
- Páginas thin → `noindex`.
- Tarefas que dependem de decisão de negócio (preço público, autor) → **perguntar antes**.

## Tarefas

### 1. Programmatic: comparação de empresas

Captura queries de altíssima intenção como "ITUB4 vs BBDC4", "PETR4 vs PRIO3".

#### Estrutura

- Rota: `app/empresas/comparar/[par]/page.tsx`
- `[par]` no formato `ticker-a-vs-ticker-b` (ex: `itub4-vs-bbdc4`)
- `generateStaticParams` gera **só pares dentro do mesmo setor** (evita comparações sem sentido tipo "ITUB4 vs MGLU3")
- Para N tickers no mesmo setor, gera N*(N-1)/2 pares ordenados alfabeticamente

#### Conteúdo da página

- H1: `{Nome A} ({TICKER A}) vs {Nome B} ({TICKER B}) — Comparação`
- Parágrafo introdutório de 40-60 palavras (extractable)
- **Tabela comparativa** lado a lado dos 5 pilares (dado real, não duplicado entre páginas)
- Destaque: qual empresa lidera cada pilar
- Veredicto neutro (não recomenda compra)
- Links para análise individual de cada empresa
- CTA → login para comparação completa

#### Schema

`Article` + `BreadcrumbList`. **Não usar `Review` nem `AggregateRating`** (não há reviews reais).

#### Indexação

- Adicionar ao sitemap principal **só pares com dados completos**
- Canonical aponta para a URL com tickers em ordem alfabética (ex: `bbdc4-vs-itub4`)
- Se usuário acessa `itub4-vs-bbdc4`, redirect 301 para `bbdc4-vs-itub4`

#### Helpful Content checklist

- ✅ Cada página tem dados financeiros únicos dos dois tickers comparados
- ✅ Veredicto/análise gerada por template é **secundário** ao dado bruto
- ❌ Não gerar para pares sem dados de ambos
- ❌ Não duplicar tabelas entre páginas (cada par tem dados próprios)

### 2. Programmatic: glossário

Captura queries informacionais "o que é p/l", "o que é roe", "o que é ebitda".

#### Estrutura

- Rota: `app/glossario/[termo]/page.tsx`
- Hub: `app/glossario/page.tsx` listando todos os termos
- Fonte: extrair termos dos blog posts existentes (`src/features/blog/data/posts.ts`) — evitar reescrever

#### Conteúdo por página

- H1: `O que é {Termo}?`
- **Definição em 40-60 palavras** no primeiro parágrafo (AEO crítico)
- Fórmula (quando aplicável)
- Exemplo prático com número real
- Quando usar / limitações
- Links para blog posts relacionados
- Links para 3 empresas reais com este indicador (cross-link com `/empresas/[ticker]`)

#### Schema

`DefinedTerm` + `BreadcrumbList`. Para fórmulas, considerar `MathSolver`/`Article`.

#### Helpful Content checklist

- ❌ Não criar termos sem definição própria do projeto
- ✅ Cada termo tem exemplo numérico real
- ✅ Cross-link com empresas e blog posts (não é doorway)

### 3. Página `/precos` pública

**Decisão de negócio necessária.** Hoje preços só aparecem em `app/assinatura/checkout/`, atrás de auth. Para AEO/SEO, preços precisam ser públicos e extractable.

#### Pergunta a fazer ao stakeholder antes de implementar

- Quais são os planos? (nome, preço mensal/anual, limites, features)
- Posso publicar valores em página pública?
- Há trial gratuito? Política de cancelamento?

#### Estrutura (após decisão)

- Rota: `app/(marketing)/precos/page.tsx`
- Tabela comparativa de planos
- FAQ específico de pricing (com `FAQPage` JSON-LD)
- Schema `Product` ou `SoftwareApplication` com `Offer` real
- CTA → checkout

### 4. `public/pricing.md` para AI agents

Depende da tarefa 3. Após pricing público, criar `public/pricing.md`:

```md
# Analiso — Pricing

## Plans

### Free
- Price: R$ 0/month
- Features: [...]
- Limits: [...]

### Pro
- Price: R$ XX/month
- Features: [...]

[etc.]

## Trial

[...]

## Cancellation

[...]
```

Formato markdown puro (sem JS) para que agents consigam parsear sem renderizar a página.

### 5. Resolver `next.config.ts` `ignoreBuildErrors`

`next.config.ts:4-6` tem `typescript.ignoreBuildErrors: true`. Isso mascara bugs e pode esconder problemas que afetam SEO (componentes server quebrados, props incorretas em metadata).

- Rodar `tsc --noEmit` e listar erros
- Resolver um por um (provavelmente várias dezenas)
- **Remover** a flag `ignoreBuildErrors` de `next.config.ts`

### 6. Auditoria de imagens marketing com `next/image`

Procurar em `src/features/landing/components/`, `src/components/layout/LandingNav.tsx` e marketing pages:

- Tags `<img>` sem `next/image`
- Imagens sem `width`/`height` (causam CLS)
- Imagens grandes não otimizadas (logos, hero images)
- Sem `priority` no LCP image (hero)

Migrar todas para `next/image` com dimensões corretas. Hero image deve ter `priority`.

### 7. Off-site presence (não é código)

Ações fora do repo, mas críticas para AI Search (mencionar em ata/Notion):

- **G2/Capterra:** criar perfil da Analiso, pedir reviews para usuários reais
- **Reddit:** participação genuína em r/investimentos, r/farialimabets — sem spam
- **YouTube:** canal explicando análises (LLMs ranqueiam YouTube alto)
- **Wikipedia:** só se houver notabilidade real (cobertura de imprensa)
- **Quora:** responder perguntas sobre análise fundamentalista linkando para blog

LLMs como ChatGPT, Claude e Perplexity pontuam menções em fontes terceiras como sinal de autoridade. Sem presence off-site, a estrutura on-site rende ~50% do potencial.

## Validação

1. Programmatic comparação: amostrar 5 pares, validar Rich Results
2. Programmatic glossário: amostrar 5 termos, validar `DefinedTerm`
3. `tsc --noEmit` passa sem erros
4. Lighthouse com imagens otimizadas: LCP < 2.5s na home
5. `pricing.md` renderiza no curl direto
6. Search Console: cobertura aumenta, impressões em queries "X vs Y" aparecem em 2-4 semanas

## Decisões pendentes (perguntar antes de executar)

- Pricing público: sim/não, valores
- Autor real do blog: pessoa física com credenciais? CNPI?
- Política de bots de IA (revisar Onda 1): bloquear `GPTBot` se preocupação com training data
- Notabilidade Wikipedia: há cobertura de imprensa?
