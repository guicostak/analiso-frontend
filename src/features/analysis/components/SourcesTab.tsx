'use client';

import React from 'react';
import { ExternalLink, Database, TrendingUp, FileText, BarChart2, Building2, Globe } from 'lucide-react';
import type { AnalysisData } from '../interfaces';

interface Source {
  name: string;
  description: string;
  type: string;
  url?: string;
  icon: React.ReactNode;
  metrics: string[];
}

const SOURCES: Source[] = [
  {
    name: 'B3 — Bolsa do Brasil',
    description: 'Dados de mercado em tempo real: preço, volume, variação, capitalização de mercado e histórico de cotações.',
    type: 'Mercado',
    url: 'https://www.b3.com.br',
    icon: <TrendingUp className="w-5 h-5" />,
    metrics: ['Preço atual', 'Volume', 'Variação diária', 'Capitalização', 'Histórico de preços'],
  },
  {
    name: 'CVM — Comissão de Valores Mobiliários',
    description: 'Demonstrações financeiras oficiais: DRE, Balanço Patrimonial e DFC enviados pelas empresas via sistema ENET.',
    type: 'Financeiro',
    url: 'https://www.gov.br/cvm',
    icon: <FileText className="w-5 h-5" />,
    metrics: ['Receita líquida', 'Lucro líquido', 'EBITDA', 'Patrimônio líquido', 'Dívida', 'Fluxo de caixa'],
  },
  {
    name: 'Proventos B3',
    description: 'Histórico completo de dividendos e juros sobre capital próprio declarados e pagos pela empresa.',
    type: 'Dividendos',
    url: 'https://www.b3.com.br',
    icon: <BarChart2 className="w-5 h-5" />,
    metrics: ['DPA (dividendo por ação)', 'Dividend Yield', 'Datas ex-dividendo', 'Datas de pagamento', 'Payout ratio'],
  },
  {
    name: 'Analiso — Modelos internos',
    description: 'Cálculos proprietários baseados nos dados públicos acima: valuation por DCF, scores de pilares, médias setoriais e indicadores derivados.',
    type: 'Modelo interno',
    icon: <Database className="w-5 h-5" />,
    metrics: ['Valor justo estimado (DCF)', 'Score por pilar', 'P/L ajustado', 'ROE / ROA / ROIC', 'Médias do setor'],
  },
  {
    name: 'Registros públicos',
    description: 'Informações cadastrais, setor de atuação, descrição de negócio e dados de governança corporativa disponíveis publicamente.',
    type: 'Cadastral',
    icon: <Building2 className="w-5 h-5" />,
    metrics: ['CNPJ', 'Setor / subsetor', 'Descrição da empresa', 'Segmento de listagem'],
  },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Mercado':        { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  'Financeiro':     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Dividendos':     { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  'Modelo interno': { bg: 'bg-brand-surface', text: 'text-brand-text', border: 'border-brand-border' },
  'Cadastral':      { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
};

export function SourcesTab({ data }: { data: AnalysisData }) {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <Database className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Fontes de dados</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Todas as informações exibidas na análise de <span className="font-semibold text-foreground">{data.company.name}</span> são
          obtidas exclusivamente de fontes públicas e oficiais. Nenhum dado é estimado sem base em fontes primárias.
        </p>
      </div>

      {/* Sources list */}
      <div className="space-y-3">
        {SOURCES.map((source) => {
          const colors = TYPE_COLORS[source.type] ?? TYPE_COLORS['Cadastral'];
          return (
            <div key={source.name} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start gap-4">

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 text-muted-foreground">
                  {source.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-[14px] font-semibold text-foreground">{source.name}</h3>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {source.type}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                    {source.description}
                  </p>

                  {/* Metrics chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {source.metrics.map((m) => (
                      <span key={m} className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* External link */}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                    title={`Visitar ${source.name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-muted rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Os dados são atualizados conforme a periodicidade de cada fonte. Demonstrações financeiras seguem o calendário de divulgação da CVM (trimestral e anual). Dados de mercado são atualizados diariamente. A Analiso não se responsabiliza por eventuais atrasos ou inconsistências nas fontes primárias.
          </p>
        </div>
      </div>

    </div>
  );
}
