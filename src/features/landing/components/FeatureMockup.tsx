export function FeatureMockup({ title }: { title: string }) {
  if (title === "Resumo Inteligente") {
    return (
      <div className="rounded-xl border border-[#F3F4F6] bg-white p-3">
        <p className="text-xs text-[#6B7280]">Resumo da empresa em 60s</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[#ECFDF5] px-2 py-2 text-[11px] font-medium text-[#065F46]">3 sinais</div>
          <div className="rounded-lg bg-[#FEF2F2] px-2 py-2 text-[11px] font-medium text-[#7F1D1D]">2 riscos</div>
        </div>
        <p className="mt-2 text-[11px] text-[#6B7280]">Primeiro você entende, depois aprofunda.</p>
      </div>
    );
  }

  if (title === "Pilares Financeiros") {
    return (
      <div className="rounded-xl border border-[#F3F4F6] bg-white p-3">
        <p className="text-xs text-[#6B7280]">Leitura por pilares</p>
        <div className="mt-2 space-y-1.5 text-[11px] text-[#374151]">
          <div className="flex items-center justify-between rounded bg-[#F9FAFB] px-2 py-1">
            <span>Dívida</span>
            <span className="font-semibold text-[#7F1D1D]">Atenção</span>
          </div>
          <div className="flex items-center justify-between rounded bg-[#F9FAFB] px-2 py-1">
            <span>Caixa</span>
            <span className="font-semibold text-[#065F46]">Saudável</span>
          </div>
          <div className="flex items-center justify-between rounded bg-[#F9FAFB] px-2 py-1">
            <span>Retorno</span>
            <span className="font-semibold text-[#92400E]">Neutro</span>
          </div>
        </div>
      </div>
    );
  }

  if (title === "Alertas em Tempo Real") {
    return (
      <div className="rounded-xl border border-[#F3F4F6] bg-white p-3">
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2">
          <p className="text-xs font-semibold text-[#166534]">O que mudou</p>
          <p className="mt-1 text-[11px] text-[#14532D]">Margem operacional caiu 1,8 p.p. vs tri anterior</p>
        </div>
        <p className="mt-2 text-[11px] text-[#6B7280]">Impacto + contexto no mesmo alerta.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#F3F4F6] bg-white p-3">
      <p className="text-xs text-[#6B7280]">Evidência oficial</p>
      <div className="mt-2 rounded bg-[#F9FAFB] px-2 py-2 text-[11px] text-[#374151]">
        <p>Fonte: CVM</p>
        <p>Documento: ITR 4T25</p>
        <p>Atualizado em 04/03</p>
      </div>
      <button
        type="button"
        className="mt-2 rounded-full border border-[#E5E7EB] px-2.5 py-1 text-[10px] font-semibold text-[#111827]"
      >
        Ver documento
      </button>
    </div>
  );
}

