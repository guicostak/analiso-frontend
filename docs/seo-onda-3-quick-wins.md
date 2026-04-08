# SEO — Onda 3: Quick wins

## Pré-requisito

Ondas 1 e 2 concluídas.

## Contexto

Mudanças pequenas e cirúrgicas que melhoram extractabilidade para AI Search (AEO/GEO/LLMO), reduzem keyword stuffing e melhoram CWV.

## Objetivo

1. Publicar `llms.txt` em `/public`.
2. Reduzir arrays de `keywords` excessivos.
3. Tornar `updatedAt` visível nos blog posts.
4. Migrar fontes para `next/font`.
5. Adicionar "Última atualização" e melhorar primeiro parágrafo de páginas marketing.

## Regras de execução

- **Leia cada arquivo antes de editar.**
- Mudanças devem ser locais e reversíveis.
- Não criar abstrações.

## Tarefas

### 1. Criar `public/llms.txt`

Conteúdo:

```
# Analiso

> Plataforma brasileira de análise fundamentalista de empresas listadas na B3. Transforma demonstrações financeiras e indicadores em leitura guiada por 5 pilares (Lucratividade, Endividamento, Eficiência, Crescimento, Valuation), com contexto histórico e pontos de atenção identificados automaticamente.

## Sobre

A Analiso não recomenda compra ou venda de ativos. Fornece análise estruturada baseada em dados oficiais publicados na CVM. Audiência: investidores pessoa física brasileiros, do iniciante ao avançado, que buscam clareza e contexto em vez de tabelas brutas.

## Páginas principais

- [Home](https://analiso.com.br/): visão geral do produto
- [Como funciona](https://analiso.com.br/como-funciona): pilares, painel, watchlist, alertas, comparação, IA Luiz
- [Para quem é](https://analiso.com.br/para-quem): perfis de usuário
- [FAQ](https://analiso.com.br/faq): perguntas frequentes sobre dados, fontes, conta e funcionamento
- [Blog](https://analiso.com.br/blog): artigos sobre análise fundamentalista, indicadores, valuation
- [Empresas](https://analiso.com.br/empresas): hub de análises de empresas da B3

## Conceitos cobertos no blog

P/L, P/VP, ROE, ROIC, Dividend Yield, EBITDA, margem líquida, dívida líquida/EBITDA, payout, valuation por múltiplos, análise fundamentalista vs técnica.

## Dados

Demonstrações financeiras oficiais publicadas pelas empresas na CVM. Atualização trimestral conforme calendário de divulgação.
```

### 2. Reduzir keyword stuffing

Em `app/(marketing)/blog/page.tsx:8-19`, o array `keywords` tem 10 termos. **Cortar para 4-5 termos focados:**

```ts
keywords: [
  "análise fundamentalista",
  "análise de ações",
  "indicadores fundamentalistas",
  "B3",
  "como investir em ações",
],
```

Aplicar a mesma regra em cada post de `src/features/blog/data/posts.ts` que tenha mais de 5 keywords. Manter os 4-5 mais relevantes. **Não inventar keywords novas — só remover excesso.**

### 3. "Última atualização" visível no blog post

Em `src/features/blog/components/BlogPostPage.tsx`, perto de `formattedDate` (linha ~270-274):

- Calcular `formattedUpdated` se `post.updatedAt` existir e for diferente de `publishedAt`
- Renderizar abaixo do título: `Última atualização: {formattedUpdated}`

LLMs (Perplexity, ChatGPT Search, Google AI Overviews) priorizam conteúdo com data de atualização **explícita e visível** — não basta estar no schema.

### 4. Migrar fontes para `next/font`

Em `app/layout.tsx`:

```tsx
import { Inter } from "next/font/google"; // ou a fonte real do projeto

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

// no <html>:
<html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
```

**Antes**, identificar qual fonte o projeto usa hoje (Tailwind v4 globals.css ou import via `@import` no CSS). Se for `Inter`, usar `Inter` do next/font. Se for outra, ajustar.

Garantir que o Tailwind aponte `font-sans` para `var(--font-sans)`.

### 5. Primeiro parágrafo extractable

Auditar:
- `app/(marketing)/page.tsx` (home, via `LandingSections.HeroSection`)
- `app/(marketing)/como-funciona/page.tsx` (linha ~144)
- `app/(marketing)/para-quem/page.tsx`
- `app/(marketing)/faq/page.tsx` (linha ~122)

Cada uma deve ter, **logo após o H1**, um parágrafo de **40-60 palavras** que defina o que é a página de forma auto-contida (sem precisar contexto). Isso é crítico para AEO — LLMs extraem este parágrafo como resposta.

Exemplo para a home:
> "A Analiso é uma plataforma brasileira de análise fundamentalista que organiza demonstrações financeiras de empresas da B3 em 5 pilares — Lucratividade, Endividamento, Eficiência, Crescimento e Valuation — com contexto histórico e pontos de atenção identificados automaticamente. Não recomenda compra ou venda; ajuda você a decidir com clareza."

Os parágrafos atuais já são bons em algumas páginas — só ajustar onde estiver muito curto ou vago.

### 6. Sinalizar `lastModified` nas marketing pages

Para `como-funciona`, `para-quem`, `faq`: adicionar exibição visível de "Atualizado em [data]" no rodapé do conteúdo (não no footer global). Hardcoded é ok desde que reflita verdade — atualizar manualmente quando o conteúdo mudar.

## Validação

1. `curl https://analiso.com.br/llms.txt` → conteúdo correto
2. Lighthouse CWV: LCP/CLS melhorados após `next/font`
3. Visualmente, blog post mostra "Última atualização" quando aplicável
4. `view-source:` em qualquer post → array `keywords` reduzido
5. Cada marketing page tem parágrafo definicional logo após H1

## Não fazer nesta onda

- Não criar páginas programáticas (Onda 4)
- Não publicar `/precos` (Onda 4)
- Não fazer presence off-site
