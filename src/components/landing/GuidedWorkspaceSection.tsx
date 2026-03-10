import { CheckCircle2, ChevronDown, Ellipsis } from "lucide-react";
import { Link } from "react-router-dom";
import logoVale from "../../assets/logos/vale.png";

const highlights = [
  "Resumo em 60s com 3 sinais e 2 pontos de atenção",
  "Contexto em linguagem simples (sem você virar analista)",
  "Evidências rastreáveis (CVM/B3/RI) com data e link na mesma tela",
  "Alertas do que mudou para você acompanhar sua watchlist sem garimpo manual",
];

export function GuidedWorkspaceSection() {
  return (
    <section className="bg-[#F4F6F9] px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto grid w-full max-w-[1454px] grid-cols-1 items-center gap-10 rounded-[24px] bg-white p-6 md:grid-cols-2 md:p-10">
        <div>
          <span className="inline-flex items-center text-sm font-medium text-[#0E9384]">Análise com clareza</span>

          <p
            className="mt-4 max-w-[620px]"
            style={{
              fontSize: "38px",
              fontWeight: 600,
              color: "#101727",
              lineHeight: "100%",
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            Mais que indicadores: entendimento para decidir com confiança.
          </p>

          <p
            className="mt-5 max-w-[560px]"
            style={{
              color: "#413e52",
              fontSize: "16px",
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Resumos claros que mostram o que mudou, por que importa e qual é a fonte oficial.
          </p>

          <ul className="mt-6 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F6F4] text-[#0E9384]">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span
                  style={{
                    color: "#334155",
                    fontSize: "16px",
                    lineHeight: "150%",
                    letterSpacing: "-0.01em",
                    fontWeight: 400,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 rounded-2xl border border-dashed border-[#94A3B8] bg-[#F8FAFC] px-5 py-4">
            <p className="text-base text-[#0E9384]">Comece em 1 minuto: escolha seu nível, selecione empresas e pronto.</p>
          </div>

          <div className="mt-7">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#14B8A6_0%,#0E9384_100%)] px-9 py-4 text-xl font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
            >
              Começar grátis
            </Link>
            <p className="mt-3 text-base text-[#64748B]">Teste gratis sem instalar nada</p>
          </div>
        </div>

        <div className="mx-auto h-[514.72px] w-[560px] max-w-full overflow-hidden rounded-[20px] bg-[#F8FAFC]">
          <div className="h-[695px] w-[756px] origin-top-left scale-[0.74]">
          <div className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] bg-white px-4 py-3">
            <div className="flex items-start gap-2.5">
              <img src={logoVale} alt="Logo da Vale" className="h-8 w-8 rounded-md object-cover" loading="lazy" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[20px] font-bold leading-none text-[#0B1220]">Vale</p>
                  <span className="rounded-full border border-[#D1D5DB] px-2 py-0.5 text-[12px] text-[#374151]">VALE3</span>
                  <span className="rounded-full border border-[#FECACA] bg-[#FEF2F2] px-2 py-0.5 text-[12px] font-semibold text-[#DC2626]">Risco • 66/100</span>
                  <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2 py-0.5 text-[12px] font-semibold text-[#0E9384]">R$ 66,20 +0,8%</span>
                </div>
                <p className="mt-1 text-[12px] text-[#4B5563]">Mineradora global com forte exposição a minério de ferro.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-[#99E3DA] bg-[#E8F6F4] px-3 py-1.5 text-[12px] font-semibold text-[#0E9384]">Na Watchlist</button>
              <button className="rounded-xl border border-[#D1D5DB] bg-white px-3 py-1.5 text-[12px] text-[#1F2937]">Criar alerta</button>
              <button className="rounded-xl border border-[#D1D5DB] bg-white px-3 py-1.5 text-[12px] text-[#1F2937]">Comparar</button>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#D1D5DB] bg-white text-[#6B7280]">
                <Ellipsis className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] bg-white px-4 py-2.5">
            <span className="rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[11px] text-[#374151]">Indústria</span>
            <span className="rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[11px] text-[#374151]">Bens de capital</span>
            <span className="rounded-full border border-[#99E3DA] bg-[#E8F6F4] px-2.5 py-1 text-[11px] font-semibold text-[#0E9384]">Atualizado: 06/02</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[11px] text-[#374151]">
              Detalhes da atualização
              <ChevronDown className="h-3 w-3" />
            </span>
            <span className="rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[11px] text-[#374151]">Fontes: CVM · B3 · RI</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 border-b border-[#E5E7EB] bg-white px-4 py-2.5 text-[14px] text-[#374151]">
            <span>Resumo</span>
            <span className="border-b-2 border-[#0E9384] pb-1.5 font-semibold text-[#111827]">Pilares</span>
            <span>O que mudou (90 dias) (3)</span>
            <span>Agenda (próximos eventos) (3)</span>
            <span>Preço</span>
            <span>Fontes</span>
          </div>

          <div className="bg-[#F8FAFC] p-4">
            <article className="rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#F59E0B] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[26px] font-bold leading-none text-[#111827]">Dívida</h3>
                    <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-semibold text-[#D97706]">Atenção</span>
                  </div>
                  <p className="mt-3 text-[14px] text-[#6B7280]">Atenção porque a alavancagem subiu e exige acompanhamento de caixa.</p>
                  <p className="mt-1 text-[12px] text-[#9CA3AF]">Fonte: CVM • Atualizado em 04/02 • Status: Atualizado</p>
                </div>
                <div className="text-right">
                  <p className="text-[34px] font-bold leading-none text-[#111827]">58/100</p>
                  <p className="mt-2 text-[13px] text-[#DC2626]">↓ 3 vs último trimestre</p>
                  <ChevronDown className="ml-auto mt-1 h-4 w-4 text-[#6B7280]" />
                </div>
              </div>

              <div className="mt-4 border-t border-[#EEF2F6] pt-3">
                <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                  <p>Indicador base: Dívida Liq./EBITDA por ano</p>
                  <div className="inline-flex rounded-full border border-[#E5E7EB] bg-white p-1">
                    <span className="rounded-full bg-[#E8F6F4] px-2 py-0.5 text-[#0E9384]">5a</span>
                    <span className="px-2 py-0.5">10a</span>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-[#EEF2F6] bg-[#FCFDFD] p-3">
                  <svg viewBox="0 0 520 96" className="h-[96px] w-full" aria-label="linha de dívida líquida por ano">
                    <line x1="10" y1="55" x2="510" y2="55" stroke="#DDE1E6" strokeDasharray="5 5" />
                    <path d="M10 72 L130 66 L250 58 L370 49 L510 40" fill="none" stroke="#D97706" strokeWidth="2" />
                    <circle cx="510" cy="40" r="4" fill="#0E9384" />
                  </svg>
                  <div className="mt-1 flex justify-between text-[11px] text-[#9CA3AF]">
                    <span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-3 text-[12px]">
                  {[
                    {
                      label: "Dívida Liq./EBITDA",
                      value: "1,6x",
                      sub: "12m +0,2x",
                      what: "Relação entre dívida líquida e geração de caixa operacional anualizada.",
                      why: "Mostra quantos anos de EBITDA seriam necessários para quitar a dívida líquida.",
                    },
                    {
                      label: "Cobertura de juros",
                      value: "6,8x",
                      sub: "12m",
                      what: "Mede quantas vezes o resultado operacional cobre as despesas financeiras.",
                      why: "Quanto maior, menor o risco de pressão no caixa com pagamento de juros.",
                    },
                    {
                      label: "Caixa vs dívida CP",
                      value: "1,3x",
                      sub: "Trimestre",
                      what: "Compara o caixa disponível com as dívidas que vencem no curto prazo.",
                      why: "Indica folga de liquidez para honrar compromissos sem estresse financeiro.",
                    },
                    {
                      label: "Prazo médio",
                      value: "3,8 anos",
                      sub: "Atual",
                      what: "Tempo médio de vencimento das dívidas da empresa.",
                      why: "Prazos maiores reduzem risco de refinanciamento concentrado no curto prazo.",
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-[#EEF2F6] bg-white p-2.5">
                      <div className="group relative inline-block">
                        <p className="cursor-help text-[11px] text-[#6B7280]">{metric.label}</p>
                        <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-[230px] rounded-lg bg-white p-2.5 shadow-[0_10px_25px_rgba(15,23,42,0.12)] group-hover:block">
                          <p className="text-[11px] leading-[1.4] text-[#374151]">
                            <span className="font-semibold text-[#111827]">O que é:</span> {metric.what}
                          </p>
                          <p className="mt-1 text-[11px] leading-[1.4] text-[#374151]">
                            <span className="font-semibold text-[#111827]">Por que importa:</span> {metric.why}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-[24px] font-bold leading-none text-[#111827]">{metric.value}</p>
                      <p className="mt-1 text-[11px] text-[#9CA3AF]">{metric.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t border-[#EEF2F6] pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#111827]">Sinais <span className="ml-2 font-normal text-[#9CA3AF]">2 sinais</span></p>
                    <button className="text-[12px] text-[#0E9384]">Ver todas</button>
                  </div>

                  <div className="space-y-2">
                    <article className="rounded-lg border border-[#E8EAED] bg-[#F9FAFB] p-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 text-[11px] text-[#D97706]">Ponto de atenção</span>
                        <span className="text-[11px] text-[#6B7280]">Moderada</span>
                      </div>
                      <p className="mt-2 text-[13px] font-semibold text-[#111827]">Dívida bruta subiu no trimestre</p>
                      <p className="mt-1 text-[12px] text-[#6B7280]"><span className="font-semibold text-[#0E9384]">1,6x</span> Dívida Liq./EBITDA</p>
                      <p className="mt-1 text-[12px] text-[#6B7280]">Por que importa: pode pressionar caixa em juros altos.</p>
                    </article>
                  </div>
                </div>
              </div>
            </article>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}



