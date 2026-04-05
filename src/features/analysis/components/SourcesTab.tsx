'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { AnalysisData } from '../interfaces';

interface Source {
  name: string;
  description: string;
  type: string;
  url?: string;
  metrics: string[];
}

const SOURCES: Source[] = [
  {
    name: 'B3 — Bolsa do Brasil',
    description: 'Dados de mercado em tempo real: preço, volume, variação, capitalização de mercado e histórico de cotações.',
    type: 'Mercado',
    url: 'https://www.b3.com.br',

    metrics: ['Preço atual', 'Volume', 'Variação diária', 'Capitalização', 'Histórico de preços'],
  },
  {
    name: 'CVM — Comissão de Valores Mobiliários',
    description: 'Demonstrações financeiras oficiais: DRE, Balanço Patrimonial e DFC enviados pelas empresas via sistema ENET.',
    type: 'Financeiro',
    url: 'https://www.gov.br/cvm',

    metrics: ['Receita líquida', 'Lucro líquido', 'EBITDA', 'Patrimônio líquido', 'Dívida', 'Fluxo de caixa'],
  },
  {
    name: 'Proventos B3',
    description: 'Histórico completo de dividendos e juros sobre capital próprio declarados e pagos pela empresa.',
    type: 'Dividendos',
    url: 'https://www.b3.com.br',

    metrics: ['DPA (dividendo por ação)', 'Dividend Yield', 'Datas ex-dividendo', 'Datas de pagamento', 'Payout ratio'],
  },
  {
    name: 'Analiso — Modelos internos',
    description: 'Cálculos proprietários baseados nos dados públicos acima: valuation por DCF, scores de pilares, médias setoriais e indicadores derivados.',
    type: 'Modelo interno',

    metrics: ['Valor justo estimado (DCF)', 'Score por pilar', 'P/L ajustado', 'ROE / ROA / ROIC', 'Médias do setor'],
  },
  {
    name: 'Registros públicos',
    description: 'Informações cadastrais, setor de atuação, descrição de negócio e dados de governança corporativa disponíveis publicamente.',
    type: 'Cadastral',

    metrics: ['CNPJ', 'Setor / subsetor', 'Descrição da empresa', 'Segmento de listagem'],
  },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Mercado':        { bg: 'bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',    border: 'border-blue-500/20' },
  'Financeiro':     { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  'Dividendos':     { bg: 'bg-violet-500/10',  text: 'text-violet-600 dark:text-violet-400',  border: 'border-violet-500/20' },
  'Modelo interno': { bg: 'bg-brand-surface', text: 'text-brand-text', border: 'border-brand-border' },
  'Cadastral':      { bg: 'bg-orange-500/10',  text: 'text-orange-600 dark:text-orange-400',  border: 'border-orange-500/20' },
};

export function SourcesTab({ data }: { data: AnalysisData }) {
  return (
    <div>
      {/* Subtitle */}
      <p className="text-[12px] text-muted-foreground/70 leading-relaxed mb-6">
        Todas as informações exibidas na análise de <span className="font-medium text-muted-foreground">{data.company.name}</span> são
        obtidas exclusivamente de fontes públicas e oficiais. Nenhum dado é estimado sem base em fontes primárias.
      </p>

      {/* Flat sources list */}
      <div>
        {SOURCES.map((source, index) => {
          const colors = TYPE_COLORS[source.type] ?? TYPE_COLORS['Cadastral'];
          const isLast = index === SOURCES.length - 1;
          return (
            <div
              key={source.name}
              className={`flex items-start gap-3 py-4 ${!isLast ? 'border-b border-white/[0.08] dark:border-white/[0.08]' : ''}`}
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[14px] font-semibold text-foreground">{source.name}</h3>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {source.type}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">
                  {source.description}
                </p>

                {/* Metrics as inline text with middle dots */}
                <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                  {source.metrics.join(' · ')}
                </p>
              </div>

              {/* External link */}
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors mt-0.5"
                  title={`Visitar ${source.name}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground/40 leading-relaxed mt-6">
        Os dados são atualizados conforme a periodicidade de cada fonte. Demonstrações financeiras seguem o calendário de divulgação da CVM (trimestral e anual). Dados de mercado são atualizados diariamente.
      </p>
    </div>
  );
}
