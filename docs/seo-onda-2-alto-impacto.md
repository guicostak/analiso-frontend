# SEO — Onda 2: Alto impacto

## Pré-requisito

**Onda 1 deve estar concluída** (sitemap, robots, metadataBase, metadata das 4 páginas marketing, AdSense via next/script, h1 na home, index.html removido).

## Contexto

Com os fundamentos no lugar, esta onda destrava a maior alavanca de tráfego do projeto (páginas públicas de empresas), corrige bugs no JSON-LD existente, e adiciona schema markup nas páginas marketing.

## Objetivo

1. Tornar `/empresas/[ticker]` público em formato freemium (visão geral pública, histórico/alertas/comparação atrás de login).
2. Corrigir o `Article` JSON-LD do blog (campo `image` faltando, logo apontando para arquivo deletado).
3. Adicionar `Organization` + `WebSite` JSON-LD no root layout.
4. Adicionar `FAQPage` JSON-LD na página `/faq`.
5. Adicionar `BreadcrumbList` JSON-LD em `/como-funciona`, `/para-quem`, `/faq`.
6. Estruturar autores com credenciais para os blog posts (E-E-A-T).

## Regras de execução

- **Leia cada arquivo antes de editar.**
- Schema markup deve refletir conteúdo **real** que existe na página. Não invente reviews, ratings, autores ou dados.
- Use o componente reutilizável `<JsonLd />` (criado nesta onda).
- Para `/empresas/[ticker]`, **só indexar tickers que tenham dados reais**. Páginas thin = `noindex`.

## Tarefas

### 1. Criar componente `<JsonLd />` reutilizável

Criar `src/components/seo/JsonLd.tsx`:

```tsx
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### 2. `Organization` + `WebSite` no root layout

Em `app/layout.tsx`, dentro do `<body>`, antes de `<Providers>`:

```tsx
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://analiso.com.br/#organization",
        name: "Analiso",
        url: "https://analiso.com.br",
        logo: "https://analiso.com.br/logo.png",
      },
      {
        "@type": "WebSite",
        "@id": "https://analiso.com.br/#website",
        url: "https://analiso.com.br",
        name: "Analiso",
        publisher: { "@id": "https://analiso.com.br/#organization" },
        inLanguage: "pt-BR",
        potentialAction: {
          "@type": "SearchAction",
          target:
            "https://analiso.com.br/buscar?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }}
/>
```

**Antes de incluir `SearchAction`**, confirmar que `/buscar?q=` realmente retorna resultados públicos. Se não, remover só o `potentialAction`.

### 3. Corrigir `Article` JSON-LD em `BlogPostPage.tsx`

Em `src/features/blog/components/BlogPostPage.tsx:207-242`:

- `publisher.logo.url` aponta para `https://analiso.com.br/favicon-32.png` que foi **deletado** (git status: `D public/favicon-32.png`). Trocar para `https://analiso.com.br/logo.png`.
- Falta o campo **obrigatório** `image` (sem ele, Article não vira rich result).
- Adicionar `image` apontando para uma OG image. Por enquanto, usar `https://analiso.com.br/logo.png` como fallback. **Idealmente**, gerar OG image dinâmica via `app/(marketing)/blog/[slug]/opengraph-image.tsx` (Next OG) — se for fazer, criar nesta tarefa.

```diff
- logo: { "@type": "ImageObject", url: "https://analiso.com.br/favicon-32.png" },
+ logo: { "@type": "ImageObject", url: "https://analiso.com.br/logo.png" },
...
+ image: ["https://analiso.com.br/logo.png"],
```

### 4. `FAQPage` JSON-LD em `/faq`

A página `app/(marketing)/faq/page.tsx` tem 16 perguntas reais no array `categories` (linhas 10-99). Após extrair o conteúdo para um client component (feito na Onda 1), o `page.tsx` server-only deve gerar:

```tsx
import { JsonLd } from "@/src/components/seo/JsonLd";
import { FAQ_CATEGORIES } from "@/src/features/marketing/data/faq"; // mover o array para cá

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_CATEGORIES.flatMap((c) =>
    c.questions.map((q) => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.a },
    }))
  ),
};
```

E renderizar `<JsonLd data={faqJsonLd} />` no server component.

### 5. `BreadcrumbList` em `como-funciona`, `para-quem`, `faq`

Para cada uma, no `page.tsx` server:

```tsx
const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://analiso.com.br" },
    { "@type": "ListItem", position: 2, name: "Como funciona", item: "https://analiso.com.br/como-funciona" },
  ],
};
```

Renderizar via `<JsonLd data={breadcrumb} />`.

### 6. Tornar `/empresas/[ticker]` público (freemium)

**Maior alavanca de tráfego do projeto.** Hoje `app/empresa/[ticker]/page.tsx` está dentro de `<ProtectedRoute>`. Vamos criar uma versão pública.

#### 6.1 Renomear rota: `/empresa/` → `/empresas/`

Mover `app/empresa/[ticker]/` para `app/empresas/[ticker]/`. Plural alinha com SEO PT-BR ("ações da Petrobras", "empresas listadas") e gera URLs mais limpas para o hub.

Adicionar redirect 301 em `next.config.ts`:

```ts
async redirects() {
  return [
    { source: "/empresa/:ticker", destination: "/empresas/:ticker", permanent: true },
  ];
}
```

#### 6.2 Criar versão pública

Em `app/empresas/[ticker]/page.tsx`, **remover `<ProtectedRoute>`** e renderizar uma versão simplificada:

- H1: `Análise de {Nome} ({TICKER})`
- Resumo do trimestre mais recente (dados públicos da CVM)
- Visão geral dos 5 pilares (sem histórico completo)
- Gráfico do trimestre (sem comparação multi-período)
- CTA grande: "Veja a análise completa, alertas e comparações" → `/login`
- 3 posts relacionados do blog
- 4 empresas relacionadas do mesmo setor (internal linking)

**Schema markup obrigatório** (`@graph`):

```ts
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://analiso.com.br" },
        { "@type": "ListItem", position: 2, name: "Empresas", item: "https://analiso.com.br/empresas" },
        { "@type": "ListItem", position: 3, name: ticker, item: `https://analiso.com.br/empresas/${ticker}` },
      ],
    },
    {
      "@type": "Corporation",
      name: nomeEmpresa,
      tickerSymbol: ticker,
      url: `https://analiso.com.br/empresas/${ticker}`,
    },
  ],
}
```

#### 6.3 `generateMetadata` dinâmico

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const empresa = await getEmpresa(ticker); // serviço já existente
  if (!empresa) return { title: "Empresa não encontrada" };
  return {
    title: `${empresa.nome} (${ticker}) — Análise fundamentalista`,
    description: `Análise de ${empresa.nome}: lucratividade, endividamento, eficiência, crescimento e valuation. Dados oficiais CVM.`,
    alternates: { canonical: `/empresas/${ticker}` },
    openGraph: { url: `/empresas/${ticker}`, type: "website" },
  };
}
```

#### 6.4 `generateStaticParams` (ou ISR)

Se a lista de tickers da B3 for finita e estável, usar `generateStaticParams`. Se houver muitos (700+), usar ISR com `revalidate: 86400`.

#### 6.5 Atualizar `app/sitemap.ts`

Adicionar todas as URLs `/empresas/[ticker]` ao sitemap. **Só incluir tickers com dados reais**, nunca tickers vazios (evita doorway pages e penalty de Helpful Content).

#### 6.6 Criar hub `/empresas`

Página `app/empresas/page.tsx` listando empresas agrupadas por setor, com links para cada `/empresas/[ticker]`. Metadata + canonical.

### 7. Autor pessoa física para blog posts (E-E-A-T)

Criar `src/features/blog/data/authors.ts`:

```ts
export interface BlogAuthor {
  id: string;
  name: string;
  role: string;
  credentials?: string;
  bio: string;
  url?: string;
}

export const AUTHORS: Record<string, BlogAuthor> = {
  // preencher com autor real do projeto — NÃO inventar
};
```

Adicionar campo `authorId: string` ao `BlogPost` em `src/features/blog/data/posts.ts`. Atualizar `ArticleJsonLd` em `BlogPostPage.tsx` para usar `Person` em vez de `Organization` quando houver autor:

```ts
author: {
  "@type": "Person",
  name: author.name,
  jobTitle: author.role,
  url: author.url,
}
```

**Não inventar autores.** Se ainda não houver decisão sobre autor real, **pular esta tarefa** e deixar marcada como TODO. Schema com autor falso é pior que sem autor.

## Validação

1. `npm run build` deve passar.
2. Google Rich Results Test em:
   - `https://analiso.com.br/blog/[qualquer-slug]` → Article válido, sem warnings
   - `https://analiso.com.br/faq` → FAQPage válida com todas as perguntas
   - `https://analiso.com.br/empresas/PETR4` (ou outro ticker real) → BreadcrumbList válida
3. `view-source:` na home → ver `Organization` + `WebSite` graph
4. `curl https://analiso.com.br/empresa/ITUB4` → 301 para `/empresas/ITUB4`
5. `https://analiso.com.br/sitemap.xml` agora inclui todas as empresas indexáveis
6. Submeter sitemap ao Google Search Console

## Não fazer nesta onda

- Não criar `llms.txt` (Onda 3)
- Não criar `/glossario/` ou `/empresas/comparar/` (Onda 4)
- Não publicar `/precos` (Onda 4 — depende de decisão de negócio)
