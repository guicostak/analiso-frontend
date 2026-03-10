import { useState } from 'react';
import { Filter, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ChangeFeedItem, 
  mockChangeFeed, 
  pillarLabels, 
  pillarColors 
} from '../../data/dashboard-feed';

export function ChangesFeedCard() {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [severityFilter, setSeverityFilter] = useState('todas');

  const severityConfig = {
    leve: { badge: 'bg-neutral-100 text-neutral-700 border-neutral-200', label: 'Leve' },
    moderada: { badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Moderada' },
    forte: { badge: 'bg-red-100 text-red-700 border-red-200', label: 'Forte' },
  };

  const statusConfig = {
    saudavel: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Saudável' },
    atencao: { badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Atenção' },
    risco: { badge: 'bg-red-50 text-red-700 border-red-200', label: 'Risco' },
  };

  const freshnessConfig = {
    atualizado: { color: 'text-emerald-600', icon: '—' },
    recente: { color: 'text-neutral-500', icon: '—' },
    antigo: { color: 'text-amber-600', icon: '—' },
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-neutral-900 mb-1">Mudanças que importam</h2>
          <p className="text-sm text-neutral-500">Feed curado com impacto · fonte · data</p>
        </div>
        <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Período:</span>
          {['7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timeFilter === period
                  ? 'bg-mint-50 text-mint-700 border border-mint-200'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-neutral-200" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Severidade:</span>
          {['todas', 'forte', 'moderada', 'leve'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-mint-50 text-mint-700 border border-mint-200'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {mockChangeFeed.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function FeedItem({ item }: { item: ChangeFeedItem }) {
  const severityConfig = {
    leve: { badge: 'bg-neutral-100 text-neutral-700 border-neutral-200', label: 'Leve' },
    moderada: { badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Moderada' },
    forte: { badge: 'bg-red-100 text-red-700 border-red-200', label: 'Forte' },
  };

  const statusConfig = {
    saudavel: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Saudável' },
    atencao: { badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Atenção' },
    risco: { badge: 'bg-red-50 text-red-700 border-red-200', label: 'Risco' },
  };

  const freshnessConfig = {
    atualizado: { color: 'text-emerald-600', icon: '—' },
    recente: { color: 'text-neutral-500', icon: '—' },
    antigo: { color: 'text-amber-600', icon: '—' },
  };

  return (
    <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl hover:border-neutral-300 hover:shadow-sm transition-all group">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-900">{item.ticker}</span>
          <span className="text-sm text-neutral-500">·</span>
          <span className="text-sm text-neutral-600">{item.companyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${severityConfig[item.severity].badge}`}>
            {severityConfig[item.severity].label}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig[item.status].badge}`}>
            {statusConfig[item.status].label}
          </span>
        </div>
      </div>

      {/* What Changed */}
      <h3 className="font-medium text-neutral-900 mb-2">{item.whatChanged}</h3>

      {/* Why Matters */}
      <p className="text-sm text-neutral-600 leading-relaxed mb-4">{item.whyMatters}</p>

      {/* Meta Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className={`px-2 py-1 rounded-md border ${pillarColors[item.pillar]}`}>
            {pillarLabels[item.pillar]}
          </span>
          <span>{new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
          <div className="flex items-center gap-1">
            <span className={freshnessConfig[item.freshness].icon + ' ' + freshnessConfig[item.freshness].color}>—</span>
            <span>{item.source} · {item.freshnessLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link 
            to={`/empresa/${item.ticker}`}
            className="px-3 py-1.5 bg-mint-500 hover:bg-mint-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            Abrir análise
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-200 transition-colors">
            <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

