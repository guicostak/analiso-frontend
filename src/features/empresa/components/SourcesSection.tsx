import { FileText, Database, Clock, CheckCircle2 } from 'lucide-react';

export function SourcesSection() {
  const dataSources = [
    { name: 'Relatórios Trimestrais (ITR)', freshness: 'Último: T1 2024', verified: true },
    { name: 'Divulgações de Resultados', freshness: 'Atualizado há 2 horas', verified: true },
    { name: 'Dados de Mercado (Tempo Real)', freshness: 'Feed ao vivo', verified: true },
    { name: 'Materiais de RI', freshness: 'Atualizado diariamente', verified: true },
  ];

  const methodology = [
    {
      title: 'Score de Crescimento',
      description: 'Crescimento de receita, lucros, tendências de market share e guidance futuro',
    },
    {
      title: 'Score de Rentabilidade',
      description: 'Margens bruta, operacional e líquida comparadas aos pares e tendências históricas',
    },
    {
      title: 'Score de Saúde Financeira',
      description: 'Índices de alavancagem, cobertura de juros, adequação de fluxo de caixa e ratings de crédito',
    },
    {
      title: 'Score de Valuation',
      description: 'P/L, P/VPA, EV/EBITDA relativo ao setor, taxa de crescimento e múltiplos históricos',
    },
    {
      title: 'Score de Momentum',
      description: 'Tendências de preço, análise de volume, sentimento de analistas e surpresas de lucro',
    },
  ];

  return (
    <section id="sources" className="scroll-mt-32">
      <div className="mb-6">
        <h2 className="text-neutral-900 mb-2">Fontes & Metodologia</h2>
        <p className="text-neutral-600">Entendendo como analisamos e pontuamos empresas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Data Sources */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Fontes de Dados</h3>
              <p className="text-sm text-neutral-500">De onde vêm nossos dados</p>
            </div>
          </div>

          <div className="space-y-3">
            {dataSources.map((source, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900 text-sm">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{source.freshness}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-mint-50 border border-mint-200 rounded-2xl">
            <p className="text-xs text-mint-700">
              <span className="font-medium">Qualidade dos Dados:</span> Todas as fontes são verificadas e cruzadas
              para garantir precisão. Scores de confiança refletem completude e recência dos dados.
            </p>
          </div>
        </div>

        {/* Update Frequency */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Frequência de Atualização</h3>
              <p className="text-sm text-neutral-500">Com que frequência atualizamos os dados</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">Dados de Mercado</span>
                <span className="text-xs font-semibold text-mint-600">Tempo Real</span>
              </div>
              <p className="text-xs text-neutral-600">
                Preço, volume e indicadores de momentum atualizados continuamente durante horário de negociação
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">Dados Fundamentalistas</span>
                <span className="text-xs font-semibold text-mint-600">Diariamente</span>
              </div>
              <p className="text-xs text-neutral-600">
                Métricas e índices financeiros recalculados diariamente após o fechamento do mercado
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900">Análise Qualitativa</span>
                <span className="text-xs font-semibold text-mint-600">Trimestral</span>
              </div>
              <p className="text-xs text-neutral-600">
                Avaliações de modelo de negócio e vantagens competitivas atualizadas com divulgação de resultados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Methodology */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Metodologia de Pontuação 5 Dimensões</h3>
            <p className="text-sm text-neutral-500">Como calculamos cada dimensão</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methodology.map((item, index) => (
            <div key={index} className="p-4 bg-neutral-50 rounded-2xl">
              <h4 className="font-medium text-neutral-900 mb-2 text-sm">{item.title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 leading-relaxed">
            <span className="font-medium text-neutral-900">Faixa de Pontuação:</span> Todas as dimensões são pontuadas
            de 0-100, onde 70+ indica desempenho forte, 50-69 é moderado, e abaixo de 50 sugere áreas
            que necessitam atenção. Scores são relativos aos pares do setor e ajustados para tamanho da empresa e estágio de crescimento.
          </p>
        </div>
      </div>
    </section>
  );
}

