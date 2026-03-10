import type { FaqItem } from "../../data/landing";

interface FaqSectionProps {
  items: FaqItem[];
}

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section id="faq" className="bg-[#F4F6F9] px-5 py-14 md:px-10 md:py-18">
      <div className="mx-auto w-full max-w-[1454px]">
        <p className="text-center" style={{ color: "#0E9384", fontSize: "12px", fontWeight: 500, lineHeight: "20px" }}>Dúvidas</p>
        <h2 className="mx-auto mt-3 max-w-[680px] text-center text-3xl font-bold leading-[1.12] tracking-[-0.01em] text-[#0F0F14] md:text-5xl">
          Ficou em duvida? Confira
          <br />
          as perguntas frequentes.
        </h2>

        <div className="mx-auto mt-8 max-w-[980px] space-y-3">
          {items.map((item) => (
            <details key={item.question} className="group rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 md:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[#111827]">
                <span className="text-[15px] font-medium leading-[1.45] md:text-lg">{item.question}</span>
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0E9384] text-base font-bold text-white group-open:hidden">
                  +
                </span>
                <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0E9384] text-base font-bold text-white group-open:inline-flex">
                  -
                </span>
              </summary>
              <p className="mt-3 border-t border-[#E5E7EB] pt-3 text-sm leading-[1.6] text-[#6B7280]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


