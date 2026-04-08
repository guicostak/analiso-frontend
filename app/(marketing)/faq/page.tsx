import type { Metadata } from "next";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { LandingNav } from "@/src/components/layout/LandingNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import { FAQ_CATEGORIES } from "@/src/features/marketing/data/faq";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_CATEGORIES.flatMap((c) =>
    c.questions.map((q) => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.a },
    })),
  ),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://analiso.com.br" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "https://analiso.com.br/faq" },
  ],
};

export const metadata: Metadata = {
  title: "Perguntas frequentes — Plataforma, dados e conta",
  description:
    "Tire suas dúvidas sobre a Analiso: o que é, como funciona, fontes dos dados, planos e como criar conta.",
  alternates: { canonical: "/faq" },
  openGraph: { url: "/faq", type: "website" },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <LandingNav />

      {/* Hero */}
      <section className="px-6 pb-16 pt-20 md:px-10 md:pt-24 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="rounded-lg bg-brand-surface px-2 py-1 text-xs font-semibold leading-[18px] text-brand-text">
              FAQ
            </span>
            <h1
              className="max-w-[640px] bg-clip-text text-[42px] font-semibold leading-[46px] tracking-[-0.42px] text-transparent md:text-[52px] md:leading-[56px]"
              style={{
                backgroundImage:
                  "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
              }}
            >
              Perguntas frequentes
            </h1>
            <p className="max-w-[480px] text-center text-lg leading-7 text-muted-foreground">
              Tudo o que você precisa saber antes de começar — sobre a
              plataforma, os dados e como funciona na prática.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <div className="mx-auto max-w-[860px] px-6 pb-24 md:px-10 lg:px-8">
        <div className="flex flex-col gap-12">
          {FAQ_CATEGORIES.map((category) => (
            <section key={category.id} id={category.id}>
              <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                {category.title}
              </h2>

              <div className="rounded-[16px] border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <Accordion type="single" collapsible className="px-6">
                  {category.questions.map((item, i) => (
                    <AccordionItem key={i} value={`${category.id}-${i}`}>
                      <AccordionTrigger className="py-5 text-sm font-medium text-foreground hover:no-underline hover:text-foreground">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-7 text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Divisor */}
      <div className="mx-auto max-w-[1430px] px-6 md:px-10 lg:px-8">
        <div className="h-px bg-border" />
      </div>

      {/* CTA final */}
      <section className="px-6 py-24 md:px-10 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div
            className="relative overflow-hidden rounded-[20px] px-10 py-16 text-center md:px-20"
            style={{
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #E8F8F4 60%, #B7E9DD 100%)",
            }}
          >
            <h2 className="mb-4 text-[36px] font-semibold leading-[40px] tracking-[-0.36px] text-foreground md:text-[44px] md:leading-[48px]">
              Ainda com dúvidas?
            </h2>
            <p className="mx-auto mb-8 max-w-[400px] text-lg leading-6 text-muted-foreground">
              A melhor forma de entender é abrindo uma análise real. Crie sua
              conta e comece em menos de um minuto.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/login"
                className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Criar conta gratuita
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/como-funciona"
                className="flex h-12 items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-6 text-sm font-semibold text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-colors hover:border-border-strong"
              >
                Ver como funciona
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
