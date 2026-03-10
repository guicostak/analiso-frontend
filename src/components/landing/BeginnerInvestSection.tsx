import { Link } from "react-router-dom";
import { BellRing, ChevronDown, FileText, Pentagon } from "lucide-react";
import valeLogo from "../../assets/logos/vale.png";
import rennerLogo from "../../assets/logos/renner.png";
import fleuryLogo from "../../assets/logos/fleury.png";

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#D4D8DE] bg-white px-2 py-1 text-[10px] text-[#475569]">
      {label}
    </span>
  );
}

function PillarRow({
  title,
  status,
  score,
  tone,
}: {
  title: string;
  status: string;
  score: string;
  tone: "teal" | "amber";
}) {
  const isTeal = tone === "teal";
  return (
    <div
      className={`rounded-xl border border-[#E8EAED] border-l-[3px] bg-white p-3 ${
        isTeal ? "border-l-[#0E9384]" : "border-l-[#F59E0B]"
      }`}
      style={{ boxShadow: "0 1px 0 rgba(16,23,39,0.02)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-[#0F172A]">{title}</p>
          <span
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isTeal ? "bg-[#ECFDF5] text-[#0F766E]" : "bg-[#FFF7ED] text-[#B45309]"
            }`}
          >
            {status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-[#0F172A]">{score}</p>
          <ChevronDown className="ml-auto h-3.5 w-3.5 text-[#94A3B8]" />
        </div>
      </div>
      <p className="mt-2 text-[10px] leading-[1.4] text-[#64748B]">Fonte: CVM • Atualizado em 04/02 • Status: Atualizado</p>
    </div>
  );
}

function ChangeRow({
  type,
  date,
  severity,
  impact,
  title,
}: {
  type: string;
  date: string;
  severity: "Leve" | "Moderada" | "Forte";
  impact: string;
  title: string;
}) {
  const accent =
    severity === "Forte" ? "border-l-[#DC2626]" : severity === "Moderada" ? "border-l-[#F59E0B]" : "border-l-[#0E9384]";
  const badge =
    severity === "Forte"
      ? "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"
      : severity === "Moderada"
        ? "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]"
        : "border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]";

  return (
    <article className={`rounded-xl border border-[#E8EAED] border-l-[3px] bg-white p-3 ${accent}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[9px] text-[#6B7280]">{type}</span>
          <span className="text-[10px] text-[#9CA3AF]">{date}</span>
          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] ${badge}`}>{severity}</span>
        </div>
        <span className="text-[9px] text-[#6B7280]">Impacta: {impact}</span>
      </div>
      <p className="mt-1 text-[11px] font-semibold text-[#111827]">{title}</p>
      <p className="mt-1 text-[9px] text-[#9CA3AF]">Fonte: CVM • Atualizado em {date}</p>
    </article>
  );
}

function SourceRow({
  category,
  source,
  doc,
  date,
  status,
}: {
  category: string;
  source: "CVM" | "B3" | "RI";
  doc: string;
  date: string;
  status: "Atualizado" | "Antigo";
}) {
  const statusClass =
    status === "Atualizado"
      ? "border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]"
      : "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]";

  return (
    <article className="rounded-lg border border-[#E8EAED] bg-white p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-[#111827]">{category}</p>
          <p className="mt-0.5 truncate text-[9px] text-[#6B7280]">{doc}</p>
        </div>
        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] ${statusClass}`}>{status}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#9CA3AF]">
        <span>Fonte: {source}</span>
        <span>{date}</span>
      </div>
    </article>
  );
}

function DashboardMockup({
  active,
  company,
}: {
  active: "Pilares" | "O que mudou" | "Resumo" | "Fontes";
  company: {
    name: string;
    ticker: string;
    score: string;
    logo: string;
    logoAlt: string;
  };
}) {
  return (
    <div className="h-full w-full overflow-hidden rounded-[18px] border border-[#DDE1E6] bg-[#F8FAFC] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img src={company.logo} alt={company.logoAlt} className="h-6 w-6 rounded-md object-contain" loading="lazy" />
          <div>
            <p className="text-[16px] font-semibold text-[#0F172A]">{company.name}</p>
            <p className="text-[10px] text-[#64748B]">{company.score} • {company.ticker}</p>
          </div>
        </div>
        <button className="rounded-md border border-[#99E3DA] bg-[#E8F6F4] px-2 py-1 text-[10px] font-medium text-[#0E9384]">
          Na Watchlist
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge label="Indústria" />
        <Badge label="Bens de capital" />
        <Badge label="Atualizado: 06/02" />
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5 border-b border-[#EEF2F6] pb-2 text-[10px] text-[#334155]">
        <span className={active === "Resumo" ? "font-semibold text-[#0E9384]" : ""}>Resumo</span>
        <span className={active === "Pilares" ? "font-semibold text-[#0E9384]" : ""}>Pilares</span>
        <span className={active === "O que mudou" ? "font-semibold text-[#0E9384]" : ""}>O que mudou</span>
        <span className={active === "Fontes" ? "font-semibold text-[#0E9384]" : ""}>Fontes</span>
      </div>

      {active === "O que mudou" ? (
        <div>
          <div className="mt-2">
            <p className="text-[11px] font-semibold text-[#111827]">O que mudou (90 dias)</p>
            <p className="text-[9px] text-[#9CA3AF]">Feed de eventos que alteraram o diagnóstico.</p>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-6 rounded-full border border-[#E5E7EB] bg-white px-2 text-[10px] font-semibold text-[#111827]">30 dias</span>
            <span className="h-6 rounded-full px-2 text-[10px] text-[#6B7280]">60 dias</span>
            <span className="h-6 rounded-full px-2 text-[10px] text-[#6B7280]">90 dias</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] text-[#6B7280]">
              Tipo
              <ChevronDown className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-2 space-y-2">
            <ChangeRow type="Resultado" date="04/02" severity="Moderada" impact="Margens" title="Margens pressionadas no trimestre" />
            <ChangeRow type="Dívida" date="03/02" severity="Forte" impact="Dívida" title="Dívida líquida/EBITDA acima do limite interno" />
            <ChangeRow type="Proventos" date="01/02" severity="Leve" impact="Proventos" title="Proventos em trajetória estável" />
          </div>
        </div>
      ) : active === "Fontes" ? (
        <div>
          <div className="mt-2">
            <p className="text-[11px] font-semibold text-[#111827]">Fontes</p>
            <p className="text-[9px] text-[#9CA3AF]">Rastreabilidade oficial por documento.</p>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-6 rounded-full border border-[#E5E7EB] bg-white px-2 text-[10px] font-semibold text-[#111827]">Financeiro</span>
            <span className="h-6 rounded-full px-2 text-[10px] text-[#6B7280]">Eventos</span>
            <span className="h-6 rounded-full px-2 text-[10px] text-[#6B7280]">Preço</span>
          </div>
          <div className="mt-2 space-y-2">
            <SourceRow category="Financeiro" source="CVM" doc="DFP 2025" date="04/02" status="Atualizado" />
            <SourceRow category="Eventos" source="B3" doc="Fato relevante" date="03/02" status="Atualizado" />
            <SourceRow category="Preço" source="B3" doc="Dados de mercado" date="05/02" status="Atualizado" />
            <SourceRow category="RI" source="RI" doc="Comunicado" date="05/02" status="Antigo" />
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <PillarRow title="Dívida" status="Atenção" score="58/100" tone="amber" />
          <PillarRow title="Caixa" status="Saudável" score="72/100" tone="teal" />
          <PillarRow title="Margens" status="Saudável" score="70/100" tone="teal" />
          <PillarRow title="Retorno" status="Saudável" score="76/100" tone="teal" />
        </div>
      )}
    </div>
  );
}

export function BeginnerInvestSection() {
  const valeCompany = {
    name: "Vale",
    ticker: "VALE3",
    score: "Risco 66/100",
    logo: valeLogo,
    logoAlt: "Logo da Vale",
  };

  const rennerCompany = {
    name: "Renner",
    ticker: "LREN3",
    score: "Atenção 64/100",
    logo: rennerLogo,
    logoAlt: "Logo da Renner",
  };

  const fleuryCompany = {
    name: "Fleury",
    ticker: "FLRY3",
    score: "Saudável 72/100",
    logo: fleuryLogo,
    logoAlt: "Logo da Fleury",
  };

  const cards = [
    {
      title: "Pilares claros",
      description: "Veja a saúde da empresa em 5 pilares, com explicação simples e contexto.",
      icon: Pentagon,
      customMedia: <DashboardMockup active="Pilares" company={valeCompany} />,
    },
    {
      title: "Mudanças que importam",
      description: "Veja o que mudou, por que importa e onde está a evidência.",
      icon: BellRing,
      customMedia: <DashboardMockup active="O que mudou" company={rennerCompany} />,
    },
    {
      title: "Fontes verificáveis",
      description: "Cada número com documento e data para você conferir quando quiser",
      icon: FileText,
      customMedia: <DashboardMockup active="Fontes" company={fleuryCompany} />,
    },
  ];

  return (
    <section className="bg-[#F4F6F9] px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1454px] rounded-[24px] p-6 md:p-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-left" style={{ color: "#0E9384", fontSize: "12px", fontWeight: 500, lineHeight: "20px" }}>
              Primeira leitura
            </p>
            <p
              className="mt-3"
              style={{
                fontSize: "38px",
                fontWeight: 600,
                color: "#101727",
                lineHeight: "100%",
                letterSpacing: "-0.02em",
                textWrap: "balance",
              }}
            >
              Entenda empresas sem se perder em indicadores.
            </p>
          </div>

          <div className="md:pt-2">
            <p style={{ color: "#413E52", fontSize: "16px", fontWeight: 400, lineHeight: 1.5 }}>
              Pare de se perder em indicadores. Veja o que mudou, por que importa e qual é a fonte em uma única leitura.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-[22px] border border-[#E5E7EB] p-4">
                <div className="h-[500px] w-full overflow-hidden rounded-[18px]">{card.customMedia}</div>

                <div className="mt-4 rounded-[16px] border border-[#E5E7EB] p-4">
                  <p className="inline-flex items-center gap-2" style={{ color: "#101727", fontSize: "18px", fontWeight: 600, lineHeight: "21.6px", letterSpacing: "-1px" }}>
                    <Icon className="h-5 w-5 text-[#0E9384]" />
                    {card.title}
                  </p>
                  <p className="mt-2" style={{ color: "#413E52", fontSize: "16px", fontWeight: 400, lineHeight: "130%", letterSpacing: "-0.16px" }}>
                    {card.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row md:items-center">
          <p style={{ fontSize: "16px", lineHeight: "150%", letterSpacing: "-1px" }}>
            <span className="banner-sub">É assim que você sai da dúvida e </span>
            <span className="banner-strong">decide com clareza e confiança.</span>
          </p>

          <Link
            to="/signup"
            className="inline-flex h-[57px] w-full max-w-[358px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#22BFAE_0%,#0E9384_100%)] text-[18px] font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
          >
            Quero conhecer a Analiso
          </Link>
        </div>
      </div>
    </section>
  );
}
