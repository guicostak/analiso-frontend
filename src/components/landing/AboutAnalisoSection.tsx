import { ChevronDown, Ellipsis } from "lucide-react";
import logoWeg from "../../assets/logos/weg.jpeg";
import logoVale from "../../assets/logos/vale.png";
import logoRenner from "../../assets/logos/renner.png";
import logoMrv from "../../assets/logos/mrv.jpg";
import logoTaesa from "../../assets/logos/taesa.png";

type QueueItem = {
  name: string;
  ticker: string;
  status: "Risco" | "Atenção" | "Saudável";
  logo: string;
};

const queueItems: QueueItem[] = [
  { name: "Vale", ticker: "VALE3", status: "Risco", logo: logoVale },
  { name: "Lojas Renner", ticker: "LREN3", status: "Atenção", logo: logoRenner },
  { name: "MRV Engenharia", ticker: "MRVE3", status: "Atenção", logo: logoMrv },
  { name: "Transmissão Paulista", ticker: "TAEE11", status: "Saudável", logo: logoTaesa },
  { name: "WEG", ticker: "WEGE3", status: "Atenção", logo: logoWeg },
];

const statusClass: Record<QueueItem["status"], string> = {
  Risco: "border-rose-300 bg-rose-100 text-rose-900",
  Atenção: "border-amber-300 bg-amber-100 text-amber-900",
  Saudável: "border-emerald-300 bg-emerald-100 text-emerald-900",
};

export function AboutAnalisoSection() {
  return (
    <section className="bg-[#F4F6F9] px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1454px] rounded-[24px] bg-white p-6 md:p-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
          <div>
            <p className="text-left" style={{ color: "#0E9384", fontSize: "12px", fontWeight: 500, lineHeight: "20px" }}>
              Conheça a Analiso
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
              A plataforma que transforma confusão em clareza.
            </p>
          </div>

          <div>
            <p style={{ color: "#413E52", fontSize: "16px", fontWeight: 600, lineHeight: "150%", letterSpacing: "-1px" }}>
              Na Analiso, acreditamos que investir com confiança começa quando você tem clareza do que importa, entende o porquê e consegue verificar a fonte.
            </p>
            <p className="mt-4" style={{ color: "#413E52", fontSize: "16px", fontWeight: 400, lineHeight: "130%", letterSpacing: "-0.16px" }}>
              Você recebe uma experiência guiada para entender empresas em minutos, acompanhar mudanças relevantes e tomar decisões mais conscientes sem precisar virar analista.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {["Clareza", "Confiança", "Decisão"].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center rounded-[40px] px-[22px] py-[12px] outline outline-1"
                  style={{
                    background: "rgba(223, 223, 223, 0.11)",
                    outlineColor: "rgba(33, 33, 33, 0.11)",
                    color: "#413E52",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 md:p-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr]">
            <aside className="rounded-2xl border border-[#E8EAED] bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#111827]">Watchlist</p>
                <span className="text-[11px] text-[#9CA3AF]">7 empresas</span>
              </div>
              <div className="mt-3 space-y-2">
                {queueItems.map((item) => (
                  <article
                    key={item.ticker}
                    className={`rounded-xl border border-l-[3px] p-2.5 ${
                      item.ticker === "WEGE3" ? "border-[#0E9384] bg-[#F8FAFC]" : "border-[#E8EAED] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <img src={item.logo} alt={item.name} className="h-7 w-7 rounded-md object-cover" loading="lazy" />
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-[#111827]">{item.name}</p>
                          <p className="text-[11px] text-[#6B7280]">{item.ticker}</p>
                        </div>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusClass[item.status]}`}>{item.status}</span>
                    </div>
                  </article>
                ))}
              </div>
            </aside>

            <div className="overflow-hidden rounded-2xl border border-[#E8EAED] bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3">
                <div className="flex items-start gap-3">
                  <img src={logoWeg} alt="Logo da WEG" className="h-10 w-10 rounded-md object-cover" loading="lazy" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[24px] font-bold leading-none text-[#0B1220]">WEG</h3>
                      <span className="rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[12px] font-medium text-[#374151]">WEGE3</span>
                      <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-semibold text-[#D97706]">
                        Atenção • 68/100
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] text-[#4B5563]">Empresa de equipamentos elétricos e automação industrial com presença global.</p>
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

              <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
                <span className="rounded-full border border-[#D1D5DB] px-3 py-1 text-[11px] text-[#374151]">Indústria</span>
                <span className="rounded-full border border-[#D1D5DB] px-3 py-1 text-[11px] text-[#374151]">Bens de capital</span>
                <span className="rounded-full border border-[#99E3DA] bg-[#E8F6F4] px-3 py-1 text-[11px] font-semibold text-[#0E9384]">Atualizado: 06/02</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#D1D5DB] px-3 py-1 text-[11px] text-[#374151]">
                  Detalhes da atualização
                  <ChevronDown className="h-3 w-3" />
                </span>
                <span className="rounded-full border border-[#D1D5DB] px-3 py-1 text-[11px] text-[#374151]">Fontes: CVM · B3 · RI</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-b border-[#E5E7EB] px-4 pt-3 text-[14px] text-[#374151]">
                <span className="border-b-2 border-[#0E9384] pb-2 font-semibold text-[#111827]">Resumo</span>
                <span className="pb-2">Pilares</span>
                <span className="pb-2">O que mudou (90 dias) (3)</span>
                <span className="pb-2">Agenda (próximos eventos) (3)</span>
                <span className="pb-2">Preço</span>
                <span className="pb-2">Fontes</span>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-12 gap-3">
                  <article className="col-span-12 rounded-xl border border-[#E8EAED] bg-white p-4 xl:col-span-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[15px] font-semibold text-[#111827]">Placar Geral</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-[#111827]">68/100</span>
                        <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-semibold text-[#D97706]">Atenção</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                      <svg width="180" height="180" viewBox="0 0 180 180" aria-label="Radar dos pilares">
                        <circle cx="90" cy="90" r="62" fill="none" stroke="#E5E7EB" />
                        <circle cx="90" cy="90" r="42" fill="none" stroke="#E5E7EB" />
                        <circle cx="90" cy="90" r="22" fill="none" stroke="#E5E7EB" />
                        <polygon
                          points="90,28 138,66 126,130 90,148 52,122 42,72"
                          fill="rgba(14,147,132,0.18)"
                          stroke="#0E9384"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px]">
                      {["Dívida 58", "Caixa 72", "Margens 70", "Retorno 76", "Proventos 62"].map((pill) => (
                        <span key={pill} className="rounded-full border border-[#D1D5DB] bg-white px-2 py-1 text-[#374151]">
                          {pill}
                        </span>
                      ))}
                    </div>
                  </article>

                  <article className="col-span-12 rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#0E9384] bg-white p-4 xl:col-span-3">
                    <h4 className="text-[14px] font-semibold text-[#111827]">Principal Força</h4>
                    <p className="mt-3 text-[22px] font-bold text-[#0E9384]">Caixa</p>
                    <p className="text-[13px] font-semibold text-[#6B7280]">72/100</p>
                    <span className="mt-2 inline-flex rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2 py-0.5 text-[11px] font-semibold text-[#0E9384]">Saudável</span>
                    <p className="mt-1 text-[12px] text-[#0E9384]">↑ 2 vs 12m</p>
                    <p className="mt-3 text-[12px] text-[#6B7280]">Geração de caixa livre consistente, com folga para execução.</p>
                  </article>

                  <article className="col-span-12 rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#F59E0B] bg-white p-4 xl:col-span-4">
                    <h4 className="text-[14px] font-semibold text-[#111827]">Principal Atenção</h4>
                    <p className="mt-3 text-[22px] font-bold text-[#D97706]">Dívida</p>
                    <p className="text-[13px] font-semibold text-[#6B7280]">58/100</p>
                    <span className="mt-2 inline-flex rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-semibold text-[#D97706]">Atenção</span>
                    <p className="mt-1 text-[12px] text-[#DC2626]">↓ 3 vs último trimestre</p>
                    <p className="mt-3 text-[12px] text-[#6B7280]">Alavancagem subiu no trimestre e exige monitoramento de caixa.</p>
                  </article>
                </div>

                <article className="mt-3 rounded-xl border border-[#E8EAED] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#111827]">Resumo em 60s (com fontes)</h4>
                      <p className="text-[12px] text-[#9CA3AF]">Uma visão simples do que está saudável e do que exige atenção.</p>
                    </div>
                    <button className="text-[12px] text-[#0E9384] hover:underline">Ver fonte</button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] text-[#6B7280]">Atualizado em 06/02</span>
                    <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] text-[#6B7280]">Fonte: CVM</span>
                    <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1 text-[11px] text-[#0E9384]">Confiança: Alta</span>
                  </div>

                  <div className="mt-4 space-y-2 text-[14px] text-[#111827]">
                    <p className="font-medium">Atenção: retorno recuou no trimestre; caixa segue resiliente.</p>
                    <p><span className="font-semibold">Força:</span> Caixa — Geração positiva e cobertura confortável.</p>
                    <p><span className="font-semibold">Atenção:</span> Dívida — Alavancagem subiu acima da referência.</p>
                    <p><span className="font-semibold">Monitorar:</span> Margens — Pressão recente em custos.</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button className="rounded-lg border border-[#0E9384] bg-[#0E9384] px-3.5 py-2 text-[13px] font-semibold text-white">
                      Ver fonte
                    </button>
                  </div>
                </article>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

