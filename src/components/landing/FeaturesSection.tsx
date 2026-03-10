import {
  ArrowUpRight,
  BellRing,
  ChartColumn,
  ClipboardList,
  LayoutDashboard,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Feature } from "../../data/landing";

interface FeaturesSectionProps {
  features: Feature[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  const baseCards = [
    { icon: ChartColumn, title: features[0]?.title ?? "Resumo Inteligente", description: features[0]?.description ?? "Veja primeiro o que exige acao." },
    { icon: ClipboardList, title: features[1]?.title ?? "Pilares Financeiros", description: features[1]?.description ?? "Conecte indicadores em pilares claros." },
    { icon: BellRing, title: features[2]?.title ?? "Alertas em Tempo Real", description: features[2]?.description ?? "Receba alertas quando algo relevante mudar." },
    { icon: ShieldCheck, title: features[3]?.title ?? "Fontes Oficiais", description: features[3]?.description ?? "Sempre com CVM, B3 e RI no mesmo fluxo." },
    {
      icon: LayoutDashboard,
      title: "Painel de mudancas",
      description: "Acompanhe o que mudou por prioridade, sem perder tempo com ruido.",
    },
    {
      icon: SearchCheck,
      title: "Comparacao rapida",
      description: "Compare empresas lado a lado e enxergue diferencas em segundos.",
    },
    {
      icon: Waypoints,
      title: "Evidencia em um clique",
      description: "Abra a origem oficial no contexto exato, sem quebrar seu fluxo.",
    },
  ];

  return (
    <section id="funcionalidades" className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto w-full max-w-[1454px] rounded-[32px] bg-[#F5F6F8] px-5 py-10 md:px-10 md:py-14">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#0E9384]">
            <Sparkles className="h-4 w-4 text-[#0E9384]" />
            Demonstracoes de valor
          </span>
          <h2
            className="mx-auto mt-4 max-w-[760px]"
            style={{
              fontSize: "38px",
              fontWeight: 600,
              color: "#101727",
              lineHeight: "100%",
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            Menos ruido, mais decisao.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {baseCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={`feature-grid-${card.title}`}
                className="rounded-2xl border border-[#E8EAED] bg-white p-6 text-center transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(15,23,42,0.10)] md:h-[233px] md:w-[302.5px]"
              >
                <span className="mx-auto inline-flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#E8F6F4] text-[#0E9384]">
                  <Icon className="h-7 w-7" />
                </span>
                <p className="mt-4" style={{ color: "#101727", fontSize: "18px", lineHeight: "21.6px", letterSpacing: "-1px", fontWeight: 600 }}>{card.title}</p>
                <p className="mt-3" style={{ color: "#7E7E7E", fontSize: "16px", fontWeight: 400, lineHeight: "20.8px", letterSpacing: "-0.01em" }}>{card.description}</p>
              </article>
            );
          })}

          <Link
            to="/signup"
            className="flex items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#14B8A6_0%,#0E9384_100%)] p-6 text-center text-white transition-all duration-200 ease-out hover:-translate-y-1 hover:brightness-95 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2 md:h-[233px] md:w-[302.5px]"
          >
            <span className="inline-flex items-center gap-1" style={{ color: "#fff", fontSize: "18px", lineHeight: "21.6px", letterSpacing: "-1px", fontWeight: 600 }}>
              Conhecer a Analiso
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}






