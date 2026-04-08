import type { Metadata } from "next";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { LandingNav } from "@/src/components/layout/LandingNav";
import {
  ArrowRight,
  Check,
  TrendingUp,
  BookOpen,
  Clock,
  Layers,
} from "lucide-react";

const profiles = [
  {
    icon: BookOpen,
    id: "iniciante",
    tag: "Começando agora",
    title: "Você está aprendendo a analisar empresas",
    description:
      "Você sabe que precisa olhar para os fundamentos antes de investir, mas toda vez que abre uma demonstração financeira ou um relatório, parece que falta um guia. Os números estão lá, mas o contexto — o que é relevante, o que é ruído, o que merece atenção — costuma ser difícil de montar.",
    forYou:
      "A Analiso organiza tudo isso por você. A análise de cada empresa começa com uma visão geral guiada, seguida por pilares claros com explicações e contexto histórico. Você não precisa saber de cor o que cada indicador significa — a plataforma te conduz.",
    items: [
      "Leitura guiada com contexto em cada etapa",
      "Indicadores explicados sem jargão excessivo",
      "Visão geral antes de mergulhar nos detalhes",
      "Histórico que mostra tendências sem precisar montar tabelas",
    ],
  },
  {
    icon: TrendingUp,
    id: "intermediario",
    tag: "Já acompanho algumas empresas",
    title: "Você já investe, mas quer acompanhar com mais qualidade",
    description:
      "Você já tem uma carteira, acompanha alguns tickers, lê resultados trimestrais. Mas o problema é outro: falta tempo e falta organização. Cada resultado exige abrir o relatório, comparar com o trimestre anterior, lembrar o que mudou. Dá trabalho — e às vezes passa coisa relevante despercebida.",
    forYou:
      "Com a Analiso você centraliza tudo. As empresas que você acompanha ficam na Watchlist e aparecem no Painel com os indicadores atualizados, as mudanças relevantes destacadas e um resumo de saúde para cada uma. Você volta ao ponto certo sem precisar reconstruir o contexto.",
    items: [
      "Painel com resumo consolidado das suas empresas",
      "Alertas de mudanças relevantes entre períodos",
      "Watchlist organizada por listas personalizadas",
      "Comparação entre empresas do mesmo setor",
    ],
  },
  {
    icon: Clock,
    id: "experiente",
    tag: "Analiso com profundidade, mas falta tempo",
    title: "Você é criterioso, mas o processo consome horas demais",
    description:
      "Você já sabe o que está fazendo. Entende de Lucratividade, Endividamento, Valuation. O problema é a fricção: abrir planilhas, buscar os dados certos, comparar série histórica, montar o racional. Tudo isso dá trabalho e tira tempo de pensar no que realmente importa.",
    forYou:
      "A Analiso comprime esse processo. As análises estão prontas, estruturadas por pilares, com séries históricas e pontos de atenção identificados. Você chega mais rápido onde quer: a conclusão informada, não a coleta de dados.",
    items: [
      "Pilares estruturados: Lucratividade, Dívida, Crescimento, Valuation",
      "Séries históricas prontas para comparação",
      "Pontos de atenção identificados automaticamente",
      "Assistente de IA para perguntas específicas sobre cada empresa",
    ],
  },
  {
    icon: Layers,
    id: "portfolio",
    tag: "Gerencie uma carteira maior",
    title: "Você acompanha muitas empresas e precisa de visão geral",
    description:
      "Quando a carteira cresce, o desafio muda. Não é mais entender cada empresa — é manter contexto de todas ao mesmo tempo. Saber quais estão bem, quais mudaram, quais merecem uma revisão agora. Com muitas empresas, fica difícil manter tudo na cabeça.",
    forYou:
      "O Painel da Analiso foi feito para esse cenário. Ele mostra a saúde de cada empresa com indicadores visuais simples, filtra por status e pilar, e te leva direto para o que precisa de atenção. Você tem uma visão de carteira sem precisar abrir empresa por empresa.",
    items: [
      "Visão consolidada de todas as empresas monitoradas",
      "Filtros por saúde, pilar e período",
      "Destaque automático para o que mudou",
      "Comparação rápida entre empresas do portfólio",
    ],
  },
];

const notForYou = [
  "Quem busca sinais de compra e venda automáticos",
  "Quem quer análise técnica e gráficos de candlestick",
  "Quem precisa de dados em tempo real para day trade",
  "Quem busca recomendações de buy/sell/hold",
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://analiso.com.br" },
    { "@type": "ListItem", position: 2, name: "Para quem", item: "https://analiso.com.br/para-quem" },
  ],
};

export const metadata: Metadata = {
  title: "Para quem é a Analiso — Iniciantes, intermediários e avançados",
  description:
    "A Analiso atende quem está aprendendo, quem já investe e quem quer aprofundar análise. Veja qual perfil combina com você.",
  alternates: { canonical: "/para-quem" },
  openGraph: { url: "/para-quem", type: "website" },
};

export default function ParaQuemPage() {
  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={breadcrumbJsonLd} />
      <LandingNav />

      {/* Hero */}
      <section className="px-6 pb-16 pt-20 md:px-10 md:pt-24 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="rounded-lg bg-brand-surface px-2 py-1 text-xs font-semibold leading-[18px] text-brand-text">
              Para quem é
            </span>
            <h1
              className="max-w-[640px] bg-clip-text text-[42px] font-semibold leading-[46px] tracking-[-0.42px] text-transparent md:text-[52px] md:leading-[56px]"
              style={{
                backgroundImage:
                  "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
              }}
            >
              Para quem quer entender empresas, não apenas ver números
            </h1>
            <p className="max-w-[500px] text-center text-lg leading-7 text-muted-foreground">
              A Analiso foi construída para investidores que analisam
              fundamentos — do iniciante que quer aprender com mais clareza ao
              experiente que quer ganhar tempo sem abrir mão de rigor.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="/login"
                className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/como-funciona"
                className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-colors hover:border-border-strong"
              >
                Como funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Perfis */}
      <section className="px-6 pb-16 md:px-10 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div className="flex flex-col gap-6">
            {profiles.map((profile) => {
              const Icon = profile.icon;
              return (
                <div
                  key={profile.id}
                  id={profile.id}
                  className="rounded-[20px] border border-border bg-card p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-10"
                >
                  <div className="flex flex-col gap-8 md:flex-row md:gap-12">
                    {/* Left */}
                    <div className="flex flex-col gap-5 md:w-[420px] md:shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface">
                          <Icon className="h-5 w-5 text-brand-text" />
                        </div>
                        <span className="rounded-lg bg-brand-surface px-2 py-1 text-xs font-semibold leading-[18px] text-brand-text">
                          {profile.tag}
                        </span>
                      </div>
                      <h2 className="text-[22px] font-semibold leading-[28px] tracking-[-0.22px] text-foreground md:text-[24px] md:leading-[30px]">
                        {profile.title}
                      </h2>
                      <p className="text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                        {profile.description}
                      </p>
                    </div>

                    {/* Divisor vertical */}
                    <div className="hidden w-px bg-border md:block" />
                    <div className="h-px bg-border md:hidden" />

                    {/* Right */}
                    <div className="flex flex-1 flex-col gap-5">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          O que você ganha
                        </p>
                        <p className="text-sm leading-6 text-foreground md:text-base md:leading-7">
                          {profile.forYou}
                        </p>
                      </div>

                      <div className="h-px bg-border" />

                      <ul className="flex flex-col gap-3">
                        {profile.items.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-surface">
                              <Check className="h-3 w-3 text-brand-text" />
                            </div>
                            <span className="text-sm leading-6 text-foreground">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Não é para você se... */}
      <section className="px-6 py-16 md:px-10 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16 md:items-start">
            <div className="md:w-[400px] md:shrink-0">
              <span className="mb-4 block rounded-lg bg-muted px-2 py-1 text-xs font-semibold leading-[18px] text-muted-foreground w-fit">
                Transparência
              </span>
              <h2 className="mb-4 text-[28px] font-semibold leading-[32px] tracking-[-0.28px] text-foreground">
                A Analiso não é para todo tipo de investidor
              </h2>
              <p className="text-base leading-7 text-muted-foreground">
                Ser honesto sobre o que a plataforma não faz é tão importante
                quanto mostrar o que ela faz. A Analiso é focada em análise
                fundamentalista. Se o que você precisa é diferente, ela
                provavelmente não é a ferramenta certa.
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Provavelmente não é pra você se...
              </p>
              {notForYou.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[12px] border border-border bg-card px-4 py-3.5"
                >
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span className="text-sm leading-6 text-muted-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divisor */}
      <div className="mx-auto max-w-[1430px] px-6 md:px-10 lg:px-8">
        <div className="h-px bg-border" />
      </div>

      {/* CTA final */}
      <section className="px-6 py-24 md:px-10 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div
            className="relative overflow-hidden rounded-[20px] px-10 py-16 text-center md:px-20"
            style={{
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #E8F8F4 60%, #B7E9DD 100%)",
            }}
          >
            <h2 className="mb-4 text-[36px] font-semibold leading-[40px] tracking-[-0.36px] text-foreground md:text-[44px] md:leading-[48px]">
              Se você se reconheceu, a Analiso é para você
            </h2>
            <p className="mx-auto mb-8 max-w-[420px] text-lg leading-6 text-muted-foreground">
              Crie sua conta e comece a analisar empresas com mais contexto,
              clareza e menos tempo perdido.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/login"
                className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Criar conta gratuita
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/como-funciona"
                className="flex h-12 items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-6 text-sm font-semibold text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-colors hover:border-border-strong"
              >
                Ver como funciona
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
