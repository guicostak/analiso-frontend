import type { PainPoint } from "../../data/landing";

interface PainSectionProps {
  painPoints: PainPoint[];
}

export function PainSection({ painPoints }: PainSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1454px] px-5 py-12 md:px-10 md:py-16">
      <div className="rounded-3xl border border-[#E8EAED] bg-white p-6 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0E9384]">A dor real</p>
        <h2 className="mt-3 max-w-[760px] text-3xl font-bold tracking-[-0.01em] text-[#0F0F14] md:text-5xl">
          O problema nao e falta de dado. E excesso sem prioridade.
        </h2>
        <p className="mt-4 max-w-[760px] text-base leading-[1.6] text-[#6B7280]">
          Se voce ja usa sites de indicadores, provavelmente sente isso: muita informacao e pouca clareza sobre o que
          muda sua decisao agora.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {painPoints.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[#E8EAED] bg-[#F9FAFB] p-5">
              <h3 className="text-lg font-semibold text-[#111827]">{item.title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-[#6B7280]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

