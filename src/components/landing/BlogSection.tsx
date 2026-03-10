import { Link } from "react-router-dom";

export function BlogSection() {
  return (
    <section className="mx-auto w-full max-w-[1454px] px-5 pb-6 pt-2 md:px-10">
      <div className="rounded-2xl border border-[#E8EAED] bg-white p-6 text-center md:p-8">
        <h2 className="text-2xl font-bold text-[#0F0F14] md:text-3xl">Quer aprender o porquê de cada métrica?</h2>
        <p className="mx-auto mt-3 max-w-[620px] text-sm leading-[1.6] text-[#6B7280] md:text-base">
          Veja primeiro o exemplo prático na plataforma e depois aprofunde com guias sem jargão.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/demo"
            className="inline-flex rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
          >
            Ver exemplo em 20s
          </Link>
          <Link
            to="/blog"
            className="inline-flex rounded-full bg-[#0E9384] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B7F74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
          >
            Ler guias
          </Link>
        </div>
      </div>
    </section>
  );
}

