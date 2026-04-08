import type { Metadata } from "next";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { LandingNav } from "@/src/components/layout/LandingNav";
import {
  BarChart3,
  BookOpen,
  Bell,
  GitCompare,
  Compass,
  Bookmark,
  MessageCircleMore,
  ArrowRight,
  Check,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    label: "Painel",
    id: "painel",
    badge: "Acompanhamento",
    title: "Seu ponto de partida para o dia",
    description:
      "O Painel é a tela principal após o login. Ele reúne as análises mais recentes das empresas que você acompanha, organizadas por relevância. Você vê de forma clara o que mudou, quais empresas merecem atenção e quais estão estáveis — sem precisar abrir cada uma individualmente.",
    items: [
      "Resumo consolidado das suas empresas",
      "Indicadores de saúde: estável, atenção ou risco",
      "Acesso rápido às análises com maior prioridade",
      "Filtros por pilar, status e período",
    ],
  },
  {
    icon: BookOpen,
    label: "Análise de empresa",
    id: "analise",
    badge: "Leitura guiada",
    title: "Entenda cada empresa com contexto e sequência",
    description:
      "A análise de cada empresa é dividida em pilares — Lucratividade, Endividamento, Eficiência, Crescimento e Valuation. Cada pilar traz os indicadores mais relevantes com contexto histórico, variação em relação a períodos anteriores e pontos de atenção identificados automaticamente.",
    items: [
      "Visão geral com resumo da empresa",
      "Leitura por pilares com contexto e histórico",
      "Mudanças relevantes entre períodos",
      "Agenda de eventos: resultados, dividendos, fatos relevantes",
      "Leitura de preço com contexto de valuation",
    ],
  },
  {
    icon: Bookmark,
    label: "Watchlist",
    id: "watchlist",
    badge: "Carteira",
    title: "Acompanhe as empresas que importam pra você",
    description:
      "Na Watchlist você organiza as empresas que deseja monitorar. Ao adicionar uma empresa, ela começa a aparecer no seu Painel com atualizações e alertas. Você pode criar listas personalizadas para separar empresas por tese, setor ou qualquer outro critério.",
    items: [
      "Adicione e organize empresas por listas",
      "Veja o resumo de cada empresa na visão de lista",
      "Receba atualizações assim que algo relevante mudar",
      "Filtre por saúde, setor e período",
    ],
  },
  {
    icon: GitCompare,
    label: "Comparação",
    id: "comparar",
    badge: "Decisão",
    title: "Compare empresas lado a lado com critério",
    description:
      "A ferramenta de comparação permite colocar duas ou mais empresas frente a frente em cada pilar de análise. Em vez de abrir várias abas e tentar lembrar os números, você vê tudo no mesmo lugar, com os mesmos critérios aplicados a cada empresa.",
    items: [
      "Comparação por pilares: Lucratividade, Dívida, Crescimento",
      "Visualização de diferenças em cada indicador",
      "Contexto histórico comparado",
      "Útil para escolher entre empresas do mesmo setor",
    ],
  },
  {
    icon: Compass,
    label: "Explorar",
    id: "explorar",
    badge: "Descoberta",
    title: "Descubra novas empresas para analisar",
    description:
      "A área de Explorar é um catálogo navegável de empresas disponíveis na plataforma. Você pode filtrar por setor, segmento ou buscar diretamente pelo ticker. É o ponto de partida para quem quer expandir sua carteira de acompanhamento ou encontrar empresas que ainda não conhece.",
    items: [
      "Catálogo com todas as empresas disponíveis",
      "Filtros por setor e segmento de mercado",
      "Busca por ticker ou nome da empresa",
      "Acesso direto à análise de qualquer empresa",
    ],
  },
  {
    icon: Bell,
    label: "Alertas",
    id: "alertas",
    badge: "Notificações",
    title: "Fique por dentro sem precisar ficar checando",
    description:
      "O sistema de alertas notifica você quando algo relevante acontece nas empresas que acompanha — resultados publicados, mudanças significativas em indicadores, fatos relevantes divulgados. Você não precisa verificar manualmente; a plataforma te avisa.",
    items: [
      "Alertas de novos resultados disponíveis",
      "Notificação de mudanças em indicadores-chave",
      "Fatos relevantes e comunicados ao mercado",
      "Controle sobre quais alertas receber",
    ],
  },
  {
    icon: MessageCircleMore,
    label: "Luiz — IA",
    id: "luiz",
    badge: "Assistente",
    title: "Tire dúvidas sobre qualquer empresa com IA",
    description:
      "O Luiz é o assistente de inteligência artificial integrado à plataforma. Você pode perguntar sobre qualquer empresa disponível — entender um indicador, comparar com o histórico, pedir um resumo da análise, ou simplesmente tirar uma dúvida conceitual. O Luiz responde com base nos dados reais da plataforma.",
    items: [
      "Perguntas sobre qualquer empresa em linguagem natural",
      "Explicações de indicadores com contexto",
      "Comparações e análises sob demanda",
      "Disponível em qualquer tela da plataforma",
    ],
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.analiso.com.br" },
    { "@type": "ListItem", position: 2, name: "Como funciona", item: "https://www.analiso.com.br/como-funciona" },
  ],
};

export const metadata: Metadata = {
  title: "Como funciona — Pilares, painel, watchlist e IA",
  description:
    "Entenda como a Analiso organiza demonstrações financeiras em 5 pilares, com painel, watchlist, alertas, comparação e o assistente Luiz.",
  alternates: { canonical: "/como-funciona" },
  openGraph: { url: "/como-funciona", type: "website" },
};

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={breadcrumbJsonLd} />
      <LandingNav />

      {/* Hero */}
      <section className="px-6 pb-16 pt-20 md:px-10 md:pt-24 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="rounded-lg bg-brand-surface px-2 py-1 text-xs font-semibold leading-[18px] text-brand-text">
              Como funciona
            </span>
            <h1
              className="max-w-[680px] bg-clip-text text-[42px] font-semibold leading-[46px] tracking-[-0.42px] text-transparent md:text-[52px] md:leading-[56px]"
              style={{
                backgroundImage:
                  "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
              }}
            >
              Uma plataforma construída para quem analisa empresas de verdade
            </h1>
            <p className="max-w-[520px] text-center text-lg leading-7 text-muted-foreground">
              A Analiso transforma demonstrações financeiras e indicadores em
              uma leitura estruturada, contextualizada e fácil de acompanhar.
              Menos ruído, mais clareza.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="/login"
                className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/para-quem"
                className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-colors hover:border-border-strong"
              >
                Para quem é
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Nav interna com âncoras */}
      <div className="sticky top-[69px] z-30 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[1430px] overflow-x-auto px-6 md:px-10 lg:px-8">
          <nav className="flex gap-0.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {features.map((f) => (
              <a
                key={f.id}
                href={`#${f.id}`}
                className="flex shrink-0 items-center gap-1.5 rounded-[8px] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Seções de funcionalidades */}
      <div className="mx-auto max-w-[1430px] px-6 md:px-10 lg:px-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isEven = index % 2 === 0;
          return (
            <section
              key={feature.id}
              id={feature.id}
              className={`flex flex-col gap-10 py-20 md:flex-row md:items-start md:gap-16 md:py-24 ${
                !isEven ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Texto */}
              <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface">
                    <Icon className="h-5 w-5 text-brand-text" />
                  </div>
                  <span className="rounded-lg bg-brand-surface px-2 py-1 text-xs font-semibold leading-[18px] text-brand-text">
                    {feature.badge}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <h2 className="text-[28px] font-semibold leading-[32px] tracking-[-0.28px] text-foreground md:text-[32px] md:leading-[36px]">
                    {feature.title}
                  </h2>
                  <p className="text-base leading-7 text-muted-foreground md:text-lg">
                    {feature.description}
                  </p>
                </div>

                <ul className="flex flex-col gap-3">
                  {feature.items.map((item) => (
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

              {/* Card visual */}
              <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-[460px] rounded-[20px] border border-border bg-card p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {feature.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {feature.badge}
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex flex-col gap-2.5">
                      {feature.items.map((item, i) => (
                        <div
                          key={item}
                          className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm ${
                            i === 0
                              ? "bg-brand-surface text-brand-text font-medium"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              i === 0 ? "bg-brand" : "bg-border-strong"
                            }`}
                          />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

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
              Pronto para começar?
            </h2>
            <p className="mx-auto mb-8 max-w-[400px] text-lg leading-6 text-muted-foreground">
              Acesse a plataforma e comece a analisar empresas com mais clareza
              e contexto.
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
                href="/para-quem"
                className="flex h-12 items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-6 text-sm font-semibold text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-colors hover:border-border-strong"
              >
                Ver para quem é
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
