import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Shield, Gift } from 'lucide-react';
import { GlossaryText } from './glossary/glossary-text';

interface FinancialHealthCardProps {
  status: 'strong' | 'moderate' | 'weak';
  score: number;
  metrics: Array<{ label: string; value: string; trend: number[] }>;
}

export function FinancialHealthCard({ status, score, metrics }: FinancialHealthCardProps) {
  const statusConfig = {
    strong: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'Forte' },
    moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'Moderada' },
    weak: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'Fraca' },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Saúde Financeira</h3>
            <p className="text-sm text-neutral-500">Liquidez & estabilidade</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}>
          {config.badge}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-semibold text-neutral-900">{score}</span>
          <span className="text-neutral-500">/100</span>
        </div>
        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-mint-500 rounded-full transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, index) => {
          const chartData = metric.trend.map((value, i) => ({ value, index: i }));
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm text-neutral-600 min-w-[100px]">{metric.label}</span>
                <span className="text-sm font-semibold text-neutral-900">{metric.value}</span>
              </div>
              <div className="w-16 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          <span className="font-medium">Por que importa:</span> Índices de liquidez sólidos indicam que a empresa pode facilmente cumprir obrigações de curto prazo.
        </p>
      </div>
    </div>
  );
}

interface CashAndDebtCardProps {
  netPosition: number;
  netPositionLabel: string;
  debtToEquity: number;
  interestCoverage: number;
  trend: number[];
}

export function CashAndDebtCard({
  netPosition,
  netPositionLabel,
  debtToEquity,
  interestCoverage,
  trend,
}: CashAndDebtCardProps) {
  const isNetCash = netPosition > 0;
  const chartData = trend.map((value, index) => ({ value, quarter: `Q${index + 1}` }));

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Caixa & Dívida</h3>
            <p className="text-sm text-neutral-500">Solidez do balanço</p>
          </div>
        </div>
      </div>

      {/* Net Position Bar */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-2xl font-semibold ${isNetCash ? 'text-emerald-600' : 'text-red-600'}`}>
            {netPositionLabel}
          </span>
          <span className="text-sm text-neutral-500">{isNetCash ? 'caixa líquido' : 'dívida líquida'}</span>
        </div>
        <div className="relative h-3 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 h-full rounded-full ${isNetCash ? 'bg-emerald-500 left-1/2' : 'bg-red-500 right-1/2'}`}
            style={{ width: '50%' }}
          />
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-neutral-300" />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-neutral-500">
          <span>Dívida Líquida</span>
          <span>Caixa Líquido</span>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">Tendência 5 Trimestres</h4>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={chartData}>
            <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-neutral-50 rounded-xl">
          <p className="text-xs text-neutral-500 mb-1">Dívida/Patrimônio</p>
          <p className="text-lg font-semibold text-neutral-900">{debtToEquity.toFixed(2)}x</p>
        </div>
        <div className="p-3 bg-neutral-50 rounded-xl">
          <p className="text-xs text-neutral-500 mb-1">Cobertura de Juros</p>
          <p className="text-lg font-semibold text-neutral-900">
            {interestCoverage > 100 ? 'ˆž' : `${interestCoverage.toFixed(1)}x`}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          <span className="font-medium">Por que importa:</span> Posição de caixa líquido proporciona flexibilidade financeira para investimentos de crescimento e crises.
        </p>
      </div>
    </div>
  );
}

interface ProfitabilityCardProps {
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number;
  history: Array<{ quarter: string; margin: number; roe: number }>;
}

export function ProfitabilityCard({
  grossMargin,
  operatingMargin,
  netMargin,
  roe,
  history,
}: ProfitabilityCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
            <Percent className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Rentabilidade</h3>
            <p className="text-sm text-neutral-500">Margens & retornos</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Melhorando</span>
        </div>
      </div>

      {/* Current Margins */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-neutral-50 rounded-xl">
          <p className="text-xs text-neutral-500 mb-1">Bruta</p>
          <p className="text-xl font-semibold text-neutral-900">{grossMargin}%</p>
        </div>
        <div className="text-center p-3 bg-neutral-50 rounded-xl">
          <p className="text-xs text-neutral-500 mb-1">Operacional</p>
          <p className="text-xl font-semibold text-neutral-900">{operatingMargin}%</p>
        </div>
        <div className="text-center p-3 bg-neutral-50 rounded-xl">
          <p className="text-xs text-neutral-500 mb-1">Líquida</p>
          <p className="text-xl font-semibold text-neutral-900">{netMargin}%</p>
        </div>
      </div>

      {/* ROE Highlight */}
      <div className="p-4 bg-mint-50 border border-mint-200 rounded-2xl mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">Retorno sobre Patrimônio</span>
          <span className="text-2xl font-semibold text-mint-700">{roe}%</span>
        </div>
      </div>

      {/* History Chart */}
      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-3">Histórico de Margem</h4>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={history}>
            <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Line
              type="monotone"
              dataKey="margin"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: '#14b8a6', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          <span className="font-medium">Por que importa:</span> Margens em expansão indicam melhora na eficiência operacional e poder de precificação.
        </p>
      </div>
    </div>
  );
}

interface ReturnsCardProps {
  hasDividend: boolean;
  dividendYield?: number;
  payoutRatio?: number;
  sharebuyback?: number;
  totalReturn?: number;
}

export function ReturnsCard({
  hasDividend,
  dividendYield,
  payoutRatio,
  sharebuyback,
  totalReturn,
}: ReturnsCardProps) {
  if (!hasDividend) {
    return (
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 mx-auto mb-3 flex items-center justify-center">
            <Gift className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-500">Sem programa de dividendos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
            <Gift className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Retornos & Dividendos</h3>
            <p className="text-sm text-neutral-500">Valor ao acionista</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-semibold text-neutral-900">{dividendYield?.toFixed(1)}%</span>
          <span className="text-neutral-500">dividend yield</span>
        </div>
        <div className="text-sm text-neutral-600">
          <GlossaryText text={`Payout: ${payoutRatio}%`} />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
          <span className="text-sm text-neutral-600">
            <GlossaryText text="Recompra de Ações (TTM)" />
          </span>
          <span className="text-sm font-semibold text-neutral-900">R$ {sharebuyback}M</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
          <span className="text-sm text-neutral-600">
            <GlossaryText text="Retorno Total (12M)" />
          </span>
          <span className="text-sm font-semibold text-emerald-600">+{totalReturn}%</span>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          <span className="font-medium">Por que importa:</span> Crescimento sustentável de dividendos sinaliza confiança da gestão e alocação de capital amigável ao acionista.
        </p>
      </div>
    </div>
  );
}

