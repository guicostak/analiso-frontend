# SEO — Onda 1: Críticos (bloqueiam indexação/ranking)

## Contexto

Você está trabalhando no projeto **Analiso** (`analiso.com.br`), Next.js 15 App Router + React 19 + Tailwind v4. Marketing público em `app/(marketing)/`. O site **não tem sitemap, não tem robots.txt, não tem metadataBase, e 4 das 5 páginas de marketing não exportam `metadata`** — todas herdam o mesmo `<title>` do root layout. Esta onda corrige os bloqueios fundamentais de SEO antes de qualquer outra otimização.

## Objetivo

Garantir que o site seja indexável, tenha sitemap/robots servidos pelo Next, que cada página marketing tenha title/description/canonical únicos, que o AdSense não bloqueie LCP, e remover o `index.html` legado de Vite.

## Regras de execução

- **Leia cada arquivo antes de editar.** Não invente caminhos.
- Não toque em rotas autenticadas.
- Não adicione comentários explicativos no código (siga o padrão do repo).
- Use `metadataBase` + paths relativos em canonicals/OG.
- `pt-BR`, locale `pt_BR`.
- URL base: `https://analiso.com.br`.

## Tarefas

### 1. Criar `app/sitemap.ts`

Sitemap com rotas estáticas (`/`, `/como-funciona`, `/para-quem`, `/faq`, `/blog`) + os 20 posts de `src/features/blog/data/posts.ts` (`BLOG_POSTS`). Use `lastModified` derivado de `updatedAt ?? publishedAt`. Prioridades: home 1.0, marketing 0.8-0.9, blog list 0.8, posts 0.7.

### 2. Criar `app/robots.ts`

- Permitir crawl geral
- Disallow: `/api/`, `/painel`, `/perfil`, `/assinatura`, `/onboarding`, `/notifications`, `/test-canvas`, `/demo`
- Permitir explicitamente bots de IA: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, `CCBot`
- Apontar `sitemap` para `https://analiso.com.br/sitemap.xml`
- Definir `host`

### 3. Corrigir `app/layout.tsx`

Atualmente (`app/layout.tsx:5-16`):
- Falta `metadataBase`
- `icons.icon` aponta para `/logo.svg` e `/logo.png` — `/logo.svg` foi **deletado** (git status: `D public/logo.svg`)
- Sem template de title
- Sem OG/Twitter no root

Aplicar:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://analiso.com.br"),
  title: {
    default: "Analiso — Análise fundamentalista de ações da B3",
    template: "%s | Analiso",
  },
  description:
    "Análise guiada de empresas brasileiras listadas na B3 em 5 pilares: Lucratividade, Endividamento, Eficiência, Crescimento e Valuation.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Analiso",
    url: "https://analiso.com.br",
  },
  twitter: { card: "summary_large_image" },
};
```

### 4. Mover AdSense para `next/script`

Em `app/layout.tsx:26-31`, o `<script async src="...adsbygoogle.js">` está dentro do `<head>` e bloqueia LCP. Substituir por:

```tsx
import Script from "next/script";

// dentro do <body>, depois de <Providers>:
<Script
  id="adsense"
  async
  strategy="afterInteractive"
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3249317765900933"
  crossOrigin="anonymous"
/>
```

Remover o `<script>` cru do `<head>`.

### 5. Adicionar `metadata` nas 4 páginas marketing sem metadata

#### 5.1 `app/(marketing)/page.tsx` (home)

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Análise fundamentalista guiada de ações da B3",
  description:
    "Transforme dados financeiros em leitura clara: 5 pilares, contexto histórico e pontos de atenção identificados automaticamente. Comece grátis.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", type: "website" },
};
```

#### 5.2 `app/(marketing)/como-funciona/page.tsx`

A página é client component (`LandingNav` etc). Como `metadata` exige server component, **extraia** o conteúdo atual para `src/features/marketing/components/ComoFuncionaPage.tsx` (client) e deixe o `page.tsx` server-only com:

```tsx
import type { Metadata } from "next";
import { ComoFuncionaPage } from "@/src/features/marketing/components/ComoFuncionaPage";

export const metadata: Metadata = {
  title: "Como funciona — Pilares, painel, watchlist e IA",
  description:
    "Entenda como a Analiso organiza demonstrações financeiras em 5 pilares, com painel, watchlist, alertas, comparação e o assistente Luiz.",
  alternates: { canonical: "/como-funciona" },
  openGraph: { url: "/como-funciona", type: "website" },
};

export default function Page() {
  return <ComoFuncionaPage />;
}
```

#### 5.3 `app/(marketing)/para-quem/page.tsx`

Mesma estratégia (extrair para client component, deixar `page.tsx` server). Metadata:

```tsx
title: "Para quem é a Analiso — Iniciantes, intermediários e avançados",
description:
  "A Analiso atende quem está aprendendo, quem já investe e quem quer aprofundar análise. Veja qual perfil combina com você.",
alternates: { canonical: "/para-quem" },
```

#### 5.4 `app/(marketing)/faq/page.tsx`

Mesma estratégia. Metadata:

```tsx
title: "Perguntas frequentes — Plataforma, dados e conta",
description:
  "Tire suas dúvidas sobre a Analiso: o que é, como funciona, fontes dos dados, planos e como criar conta.",
alternates: { canonical: "/faq" },
```

### 6. Verificar e adicionar `<h1>` na home

`grep "<h1"` em `src/features/landing/components/LandingPage.tsx` e `LandingSections.tsx` retornou vazio. **Inspecione `HeroSection`** dentro de `LandingSections.tsx` e confirme se há `<h1>`. Se não houver, adicione um. Sugestão de texto: **"Análise fundamentalista guiada de empresas da B3"**. Garanta que é o **único `<h1>`** da página.

### 7. Deletar `index.html` legado

O arquivo `index.html` na raiz é resquício de uma migração Vite → Next. Referencia `/src/main.tsx` que não é usado pelo Next. Não é servido em produção, mas confunde auditorias e duplica o tag de AdSense. **Deletar o arquivo.**

## Validação

Após implementar, rodar:

1. `npm run build` — build deve passar.
2. `npm run start` e visitar:
   - `http://localhost:3000/robots.txt` → conteúdo correto, com bots de IA listados
   - `http://localhost:3000/sitemap.xml` → 5 rotas estáticas + 20 posts
   - `view-source:http://localhost:3000/` → `<title>` único, OG tags presentes, **um único `<h1>`**
   - `view-source:http://localhost:3000/como-funciona` → `<title>` diferente da home, canonical correto
   - `view-source:http://localhost:3000/faq` → mesmo
3. Confirmar que `index.html` na raiz **não existe mais**.
4. Lighthouse na home → SEO score 100, LCP melhor que antes (AdSense não-bloqueante).

## Não fazer nesta onda

- Não mexer em JSON-LD (Onda 2)
- Não criar `llms.txt` (Onda 3)
- Não tornar `/empresa/[ticker]` público (Onda 2)
- Não mexer em `next.config.ts` `ignoreBuildErrors` (Onda 4)
