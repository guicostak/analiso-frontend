# SEO — Plano de execução em 4 ondas

Auditoria completa em `seo-onda-1-criticos.md` → `seo-onda-4-longo-prazo.md`. Cada arquivo é um prompt auto-contido para o Claude executar.

## Como usar

1. Abra o Claude no projeto.
2. Cole o conteúdo do arquivo da onda atual como prompt.
3. Aguarde execução e validação.
4. Só passe para a próxima onda após validar a anterior.

## Ordem obrigatória

| Onda | Arquivo | O que destrava | Pré-requisito |
|---|---|---|---|
| 1 | `seo-onda-1-criticos.md` | Indexação básica, sitemap, robots, metadata, AdSense não-bloqueante | — |
| 2 | `seo-onda-2-alto-impacto.md` | `/empresas/[ticker]` público (maior alavanca), JSON-LD em todas as marketing pages, Article corrigido | Onda 1 |
| 3 | `seo-onda-3-quick-wins.md` | `llms.txt`, fontes via next/font, extractabilidade AEO | Ondas 1+2 |
| 4 | `seo-onda-4-longo-prazo.md` | Programmatic SEO (comparação, glossário), `/precos` público, dívida técnica | Ondas 1+2+3 |

## Decisões de negócio que travam a execução

- **Onda 1:** decidir política de bots de IA (permitir treinamento ou só retrieval)
- **Onda 2:** confirmar se `/empresas/[ticker]` pode ser parcialmente público (freemium)
- **Onda 2:** definir autor real para blog posts (E-E-A-T)
- **Onda 4:** publicar pricing público
- **Onda 4:** off-site presence (G2, Reddit, YouTube)
