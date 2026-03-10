import { Link } from "react-router-dom";

export function ComparisonCtaBanner() {
  return (
    <section className="bg-[#F4F6F9] px-5 pb-6 md:px-10 md:pb-10">
      <div className="mx-auto w-full max-w-[1454px]">
        <article
          className="relative overflow-hidden rounded-[24px] p-8 text-white shadow-[inset_0_4px_4px_rgba(255,255,255,0.32)] md:px-16 md:py-14"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 45%), linear-gradient(180deg, #22BFAE 0%, #0E9384 100%)",
            backgroundSize: "cover",
          }}
        >
          <div className="relative z-10 max-w-[560px]">            <p className="mt-3" style={{ fontSize: "34.92px", fontWeight: 600, color: "#fff", textWrap: "balance", fontFamily: "Inter, sans-serif" }}>
              Experimente na pratica por 28 dias gratis.
            </p>
            <p className="mt-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "24px", textAlign: "left", color: "#fff" }}>
              Organize sinais, priorize o que importa e acesse a fonte oficial sem quebrar seu fluxo.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex h-[56px] w-full max-w-[460px] items-center justify-center rounded-full bg-white px-8 text-[20px] font-semibold text-[#101727] transition hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E9384]"
            >
              Iniciar teste gratis agora
            </Link>
          </div>

          <div className="pointer-events-none absolute -right-10 bottom-0 hidden h-[260px] w-[520px] rounded-tl-[24px] border border-white/30 bg-white/12 p-5 backdrop-blur-sm lg:block">
            <div className="rounded-2xl border border-white/35 bg-white p-4 text-[#111827] shadow-[0_14px_35px_-20px_rgba(0,0,0,0.45)]">
              <p className="text-sm font-semibold">Resumo da sua carteira</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                  <p className="text-[#6B7280]">Sinais ativos</p>
                  <p className="mt-1 text-base font-semibold text-[#101727]">3 importantes</p>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                  <p className="text-[#6B7280]">Riscos</p>
                  <p className="mt-1 text-base font-semibold text-[#101727]">2 em revisao</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#6B7280]">Com fonte CVM/B3/RI em 1 clique.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}



