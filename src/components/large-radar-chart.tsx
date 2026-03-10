import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { SnowflakeChart, SnowflakeDimension } from './snowflake-chart';

interface LargeRadarChartProps {
  dimensions: {
    growth: { score: number; trend: 'up' | 'down' | 'stable' };
    profitability: { score: number; trend: 'up' | 'down' | 'stable' };
    debt: { score: number; trend: 'up' | 'down' | 'stable' };
    valuation: { score: number; trend: 'up' | 'down' | 'stable' };
    momentum: { score: number; trend: 'up' | 'down' | 'stable' };
  };
  confidence: number;
  lastRefreshed: string;
}

export function LargeRadarChart({ dimensions, confidence, lastRefreshed }: LargeRadarChartProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
    return <Minus className="w-3.5 h-3.5 text-neutral-400" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  // Determine overall status based on average score
  const avgScore = (dimensions.growth.score + dimensions.profitability.score + 
                    dimensions.debt.score + dimensions.valuation.score + 
                    dimensions.momentum.score) / 5;
  const status: 'healthy' | 'attention' | 'risk' = 
    avgScore >= 70 ? 'healthy' : avgScore >= 50 ? 'attention' : 'risk';

  const dimensionList = [
    { name: 'Crescimento', data: dimensions.growth },
    { name: 'Rentabilidade', data: dimensions.profitability },
    { name: 'Saúde Financeira', data: dimensions.debt },
    { name: 'Valuation', data: dimensions.valuation },
    { name: 'Momentum', data: dimensions.momentum },
  ];

  // Transform data for Snowflake chart
  const snowflakeData: SnowflakeDimension[] = [
    {
      label: 'Crescimento',
      value: dimensions.growth.score,
      why: 'O crescimento de receita e lucros indica a capacidade da empresa de expandir participação de mercado e escalar operações de forma lucrativa.',
      metric: `${dimensions.growth.score}/100 pontos`,
    },
    {
      label: 'Rentabilidade',
      value: dimensions.profitability.score,
      why: 'Margens de lucro e retornos demonstram eficiência operacional e poder de precificação competitivo no mercado.',
      metric: `${dimensions.profitability.score}/100 pontos`,
    },
    {
      label: 'Saúde Financeira',
      value: dimensions.debt.score,
      why: 'Solidez do balanço e índices de alavancagem mostram a estabilidade financeira da empresa e capacidade de resistir a crises.',
      metric: `${dimensions.debt.score}/100 pontos`,
    },
    {
      label: 'Valuation',
      value: dimensions.valuation.score,
      why: 'Múltiplos de valuation relativos aos pares e taxas de crescimento ajudam a identificar se a ação está bem precificada ou oferece oportunidade.',
      metric: `${dimensions.valuation.score}/100 pontos`,
    },
    {
      label: 'Momentum',
      value: dimensions.momentum.score,
      why: 'Tendências de preço e sentimento do mercado refletem a confiança dos investidores e podem sinalizar pontos de inflexão potenciais.',
      metric: `${dimensions.momentum.score}/100 pontos`,
    },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-8">
      <div className="mb-6">
        <h3 className="text-neutral-900 mb-1">Avaliação 5 Dimensões</h3>
        <p className="text-sm text-neutral-500">Score de saúde abrangente em métricas-chave</p>
      </div>

      {/* Snowflake Radar Chart */}
      <div className="mb-6 flex justify-center">
        <SnowflakeChart 
          dimensions={snowflakeData}
          size="large"
          status={status}
        />
      </div>

      {/* Legend with Scores */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {dimensionList.map((dim, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
          >
            <div className="flex items-center gap-2">
              {getTrendIcon(dim.data.trend)}
              <span className="text-sm text-neutral-700">{dim.name}</span>
            </div>
            <span className={`font-semibold ${getScoreColor(dim.data.score)}`}>
              {dim.data.score}
            </span>
          </div>
        ))}
      </div>

      {/* Confidence Indicator */}
      <div className="pt-6 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">Confiança dos Dados</span>
          </div>
          <span className="text-sm font-semibold text-neutral-900">{confidence}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-mint-500 rounded-full transition-all"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-2">Atualizado {lastRefreshed}</p>
      </div>
    </div>
  );
}
