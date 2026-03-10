export function HeroChart() {
  const updatedAt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date());

  return (
    <div className="relative mx-auto mt-10 w-full max-w-[560px] md:mt-0">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,147,132,0.10)_0%,rgba(14,147,132,0)_75%)] blur-[50px]" />

      <article className="landing-rise-up relative z-20 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.10)] md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">Resumo em 60s</p>
            <p className="mt-1 text-xl font-bold text-[#111827]">VALE3 hoje</p>
          </div>
          <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0B7F74]">Leitura simples</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7280]">3 sinais</p>
            <ul className="mt-2 space-y-1.5 text-sm text-[#374151]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0E9384]" />
                Margem estável no trimestre
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0E9384]" />
                Caixa cobre obrigações de curto prazo
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0E9384]" />
                Proventos mantidos
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7F1D1D]">2 riscos</p>
            <ul className="mt-2 space-y-1.5 text-sm text-[#7F1D1D]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                Dívida líquida subiu
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                Retorno caiu vs setor
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Ver evidencia
            </button>
            <p className="mt-1 text-[11px] text-[#6B7280]">Abre o documento oficial aqui mesmo.</p>
          </div>
          <p className="text-xs text-[#6B7280]">Fonte: CVM/B3/RI â€¢ Atualizado em {updatedAt}</p>
        </div>
      </article>

      <article className="landing-rise-up relative -bottom-4 left-3 z-30 inline-flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] motion-safe:[animation-delay:150ms]">
        <p className="text-sm font-semibold text-[#111827]">Watchlist</p>
        <p className="text-sm text-[#6B7280]">14 empresas â€¢ 4 alertas ativos hoje</p>
      </article>
    </div>
  );
}

