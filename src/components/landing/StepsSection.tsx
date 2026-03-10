import {
  BellRing,
  ChartColumn,
  ClipboardList,
  Clock3,
  LayoutDashboard,
} from "lucide-react";
import type { Step } from "../../data/landing";
import resumoBannerImage from "../../assets/landing/resumo-banner-image.png";

interface StepsSectionProps {
  steps: Step[];
}

export function StepsSection({ steps }: StepsSectionProps) {
  const cards = [
    {
      id: steps[0]?.id ?? "01",
      title: steps[0]?.title ?? "Escolha seu nivel",
      description:
        steps[0]?.description ??
        "Voce comeca no modo iniciante ou intermediario e recebe a analise no nivel certo de linguagem.",
      icon: ClipboardList,
    },
    {
      id: steps[1]?.id ?? "02",
      title: steps[1]?.title ?? "Selecione empresas",
      description:
        steps[1]?.description ??
        "Adicione os ativos da sua watchlist e definimos o que precisa de atencao primeiro.",
      icon: BellRing,
    },
    {
      id: steps[2]?.id ?? "03",
      title: steps[2]?.title ?? "Receba resumo + evidencias",
      description:
        steps[2]?.description ??
        "Voce ve resumo em 60s, abre a evidencia oficial com um clique e entende sem virar analista.",
      icon: ChartColumn,
    },
    {
      id: "04",
      title: "Veja tudo em uma tela so",
      description: "Acompanhe mudancas, prioridade e fonte oficial no mesmo fluxo.",
      icon: LayoutDashboard,
    },
  ];

  return (
    <section id="como-funciona" className="bg-white px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-[20px]">
        <div
          className="relative z-[1] flex w-full flex-col items-center gap-[20px] rounded-[24px] bg-white p-[30px] md:h-[808px]"
          style={{ boxShadow: "0 0 64px 0 #FFFAF3" }}
        >
          <div className="text-center">
          <span className="inline-flex items-center text-sm font-medium text-[#0E9384]">
            Analise simplificada
          </span>

          <p
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
            Do caos de indicadores para clareza em minutos
          </p>
          </div>

          <div className="mt-10 grid w-full grid-cols-1 gap-[20px] md:grid-cols-2 md:justify-items-center">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={`step-card-${card.id}`}
                className="flex w-full max-w-[600px] items-center gap-3 rounded-[14px] border border-[rgba(14,147,132,0.09)] bg-white p-6 text-left md:h-[120px]"
              >
                <span className="inline-flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[12px] bg-[#E8F6F4] text-[#0E9384]">
                  <Icon className="h-8 w-8" />
                </span>

                <div>
                  <p
                    style={{
                      color: "#101727",
                      fontSize: "18px",
                      lineHeight: "21.6px",
                      letterSpacing: "-1px",
                      fontWeight: 600,
                    }}
                  >
                    {card.title}
                  </p>
                  <p
                    className="mt-1"
                    style={{
                      color: "#7E7E7E",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "20.8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </article>
            );
          })}
          </div>

          <article className="resumo-banner relative mx-auto mt-6 gap-4 border border-[#0B7F74] bg-[#0E9384] text-left md:w-[1220px]">
          <span className="icon-box white">
            <Clock3 className="h-7 w-7 text-[#0E9384]" />
          </span>
          <div>
            <p
              style={{
                color: "#fff",
                fontSize: "18px",
                lineHeight: "21.6px",
                letterSpacing: "-1px",
                fontWeight: 600,
              }}
            >
              Resumo em 60s com evidencias oficiais
            </p>
            <p className="mt-2 max-w-[880px]"
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "20.8px",
                letterSpacing: "-0.01em",
              }}
            >
              Veja os principais sinais e riscos com contexto e abra a fonte CVM/B3/RI sem sair da tela.
            </p>
          </div>
          <div className="pointer-events-none absolute -right-20 top-1/2 h-[280px] w-[520px] -translate-y-1/2">
            <img src={resumoBannerImage} alt="Resumo com evidências" className="h-full w-full object-cover object-right" loading="lazy" />
          </div>
          </article>
        </div>
      </div>
    </section>
  );
}








