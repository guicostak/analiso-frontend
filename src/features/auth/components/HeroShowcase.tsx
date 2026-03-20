"use client";

const testimonials = [
  {
    name: "Marina Costa",
    role: "Analista Jr.",
    text: "Finalmente entendi o que mudou com fonte e contexto.",
  },
  {
    name: "Rafael Lima",
    role: "Investidor PF",
    text: "Os 5 pilares deixam tudo mais objetivo.",
  },
  {
    name: "Paula Ribeiro",
    role: "Finanças",
    text: "Sem enrolação: ponto forte, ponto de atenção e por quê.",
  },
  {
    name: "Bruno Silveira",
    role: "Empreendedor",
    text: "Resumo em 60s que dá segurança para decidir rápido.",
  },
];

const pillars = [
  { label: "Dívida", value: "7,1" },
  { label: "Caixa", value: "8,4" },
  { label: "Margens", value: "6,8" },
  { label: "Retorno", value: "8,1" },
  { label: "Proventos", value: "7,4" },
];

export function HeroShowcase() {
  return (
    <div className="relative w-full rounded-[28px] border border-[#EAECF0] bg-gradient-to-br from-white via-[#F7F8FA] to-[#ECF6F4] shadow-xl overflow-hidden">
      <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-[#0E9384]/10 blur-3xl" />
      <div className="absolute -bottom-24 left-6 w-44 h-44 rounded-full bg-[#0E9384]/10 blur-3xl" />

      <div className="relative p-8 lg:p-10">
        <div className="relative min-h-[340px]">
          {/* Card 1: Dashboard Mudanças */}
          <div className="absolute left-0 top-6 w-[270px] bg-white border border-[#EAECF0] rounded-2xl shadow-lg p-4 rotate-[-3deg]">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#667085]">Mudanças que importam</p>
              <span className="text-[10px] text-[#0E9384] font-medium">Atualizado</span>
            </div>
            <div className="mt-3 space-y-2">
              {[
                {
                  company: "WEG S.A. (WEGE3)",
                  change: "Caixa líquido acima do histórico",
                  impact: "Impacta: Caixa • 05/02",
                },
                {
                  company: "PETR4",
                  change: "Proventos abaixo da média 4T",
                  impact: "Impacta: Proventos • 01/02",
                },
              ].map((item) => (
                <div key={item.change} className="rounded-xl border border-[#EAECF0] p-3">
                  <p className="text-[10px] text-[#667085]">{item.company}</p>
                  <p className="text-xs font-semibold">{item.change}</p>
                  <p className="text-[10px] text-[#98A2B3] mt-1">{item.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Resumo em 60s */}
          <div className="absolute right-6 top-0 w-[320px] bg-white border border-[#EAECF0] rounded-2xl shadow-xl p-5 rotate-[2deg]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#667085]">Resumo em 60s</p>
                <p className="text-sm font-semibold">WEG S.A. (WEGE3)</p>
              </div>
              <span className="text-[10px] text-[#667085]">CVM • 05/02</span>
            </div>
            <div className="mt-4 grid grid-cols-[120px_1fr] gap-3">
              <div className="flex flex-col items-center">
                <div className="w-[110px] h-[110px] rounded-full border border-[#EAECF0] flex items-center justify-center bg-[#F7F8FA]">
                  <svg viewBox="0 0 120 120" className="w-[90px] h-[90px]">
                    <polygon
                      points="60,12 92,38 78,82 42,82 28,38"
                      fill="#0E9384"
                      opacity="0.15"
                    />
                    <polygon points="60,22 84,40 72,76 48,76 36,40" fill="none" stroke="#0E9384" />
                    <circle cx="60" cy="60" r="2" fill="#0E9384" />
                  </svg>
                </div>
                <div className="mt-2 w-full space-y-1 text-[10px] text-[#475467]">
                  {pillars.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="text-[#0B1220] font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-[#EAECF0] p-3">
                  <p className="text-[11px] text-[#667085]">Ponto forte</p>
                  <p className="text-xs font-semibold">Retorno acima da mediana</p>
                  <p className="text-[10px] text-[#475467] mt-1">
                    Evidência: ROE 10a 18% • ITR 3T24
                  </p>
                </div>
                <div className="rounded-lg border border-[#EAECF0] p-3">
                  <p className="text-[11px] text-[#667085]">Atenção</p>
                  <p className="text-xs font-semibold">Margens sob pressão</p>
                  <p className="text-[10px] text-[#475467] mt-1">
                    Evidência: -1,2 p.p. • ITR 3T24
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Explorar */}
          <div className="absolute left-16 bottom-0 w-[300px] bg-white border border-[#EAECF0] rounded-2xl shadow-lg p-4 rotate-[1deg]">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#667085]">Explorar mercado</p>
              <span className="text-[10px] text-[#667085]">B3</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Dívida", value: "Baixa" },
                { label: "Margens", value: "Estável" },
                { label: "Retorno", value: "Alta" },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-[#EAECF0] p-2">
                  <p className="text-[10px] text-[#667085]">{card.label}</p>
                  <p className="text-xs font-semibold">{card.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-[#EAECF0] p-3">
              <p className="text-[10px] text-[#667085]">Destaque do dia</p>
              <p className="text-xs font-semibold">WEGE3 lidera em retorno ajustado</p>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {testimonials.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0E9384]/15 border border-[#0E9384]/20" />
                <div>
                  <p className="text-xs font-semibold">{item.name}</p>
                  <p className="text-[10px] text-[#667085]">{item.role}</p>
                </div>
              </div>
              <p className="text-xs text-[#344054] mt-2">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroShowcase;
