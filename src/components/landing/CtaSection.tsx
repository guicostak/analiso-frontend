import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="h-[339.59px] w-full bg-[#0E9384] px-6 py-12 text-center text-white md:px-10 md:py-16">
        <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]">
          <h2
            className="mx-auto max-w-[920px]"
            style={{ color: "#fff", fontSize: "38px", fontWeight: 600, lineHeight: 1.2, textWrap: "balance" }}
          >
            Pronto para transformar sua análise?
          </h2>

          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-white text-[#0E9384] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E9384]"
              style={{ width: "358px", height: "57px", fontSize: "18px", fontWeight: 600 }}
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

