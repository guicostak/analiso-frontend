interface DataSourcesSectionProps {
  dataSources: string[];
}

export function DataSourcesSection({ dataSources }: DataSourcesSectionProps) {
  return (
    <section className="border-y border-[#E8EAED] bg-white px-5 py-8 md:px-10" aria-label="Fontes de dados">
      <div className="mx-auto w-full max-w-[1454px]">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Rastreabilidade oficial</p>
        <p className="mb-4 text-center text-sm text-[#6B7280]">Cada insight aponta para a origem: sem caixa-preta, sem chute.</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:justify-between">
          {dataSources.map((source) => (
            <p key={`source-${source}`} className="text-sm text-[#6B7280] opacity-70 transition hover:opacity-90">
              {source}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

