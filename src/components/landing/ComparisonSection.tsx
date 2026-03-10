import { Check, X } from "lucide-react";
import type { ComparisonRow } from "../../data/landing";

interface ComparisonSectionProps {
  comparisonRows: ComparisonRow[];
}

function CellIcon({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0E9384] text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
      </span>
    );
  }

  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#D1D5DB] text-white">
      <X className="h-3.5 w-3.5" strokeWidth={2.8} />
    </span>
  );
}

export function ComparisonSection({ comparisonRows }: ComparisonSectionProps) {
  return (
    <section className="bg-[#F4F6F9] px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto w-full max-w-[1454px]">
        <p className="text-center" style={{ color: "#0E9384", fontSize: "12px", fontWeight: 500, lineHeight: "20px" }}>
          Enquanto outros sites te afogam em indicadores,
        </p>
        <p className="mx-auto mt-3 max-w-[760px] text-center" style={{ fontSize: "38px", fontWeight: 600, color: "#101727", lineHeight: "100%", letterSpacing: "-0.02em", textWrap: "balance" }}>
          nós organizamos o que importa com contexto, simplicidade e confiança.
        </p>

        <div className="mt-10 overflow-hidden rounded-[24px] border border-[#DDE1E6] bg-white">
          <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr] border-b border-[#DDE1E6] text-sm font-semibold text-[#111827]">
            <p className="px-5 py-5 md:px-6">Funcionalidade</p>
            <p className="bg-[#ECFDF5] px-5 py-5 text-center text-[#0B7F74] md:px-6">Analiso</p>
            <p className="px-5 py-5 text-center md:px-6">Status Invest</p>
            <p className="px-5 py-5 text-center md:px-6">Fundamentus</p>
          </div>

          {comparisonRows.map((row, idx) => (
            <div
              key={`${row.feature}-${idx}`}
              className={`grid grid-cols-1 border-b border-[#E5E7EB] md:grid-cols-[1.7fr_1fr_1fr_1fr] ${
                idx === comparisonRows.length - 1 ? "border-b-0" : ""
              }`}
            >
              <div className="px-5 py-4 md:px-6">
                <p className="text-sm text-[#374151]">{row.feature}</p>
                {row.detail ? <p className="mt-1 text-xs text-[#6B7280]">{row.detail}</p> : null}
              </div>

              <div className="flex items-center justify-center bg-[#F0FDF4] px-5 py-4 md:px-6">
                <CellIcon enabled={row.analiso} />
              </div>
              <div className="flex items-center justify-center px-5 py-4 md:px-6">
                <CellIcon enabled={row.statusInvest} />
              </div>
              <div className="flex items-center justify-center px-5 py-4 md:px-6">
                <CellIcon enabled={row.fundamentus} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}







