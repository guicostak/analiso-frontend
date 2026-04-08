import { AlertTriangle, Bell, Plus, Database, ArrowRight, Eye, Compass, GitCompare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { 
  mockAttentionCompanies, 
  mockActiveAlerts, 
  mockDataQualityWarnings,
  pillarLabels 
} from '@/src/data/dashboard-feed';

export function RightRail() {
  return (
    <div className="space-y-6">
      <AttentionNowCard />
      <AlertsCard />
      <DataQualityCard />
      <ShortcutsCard />
    </div>
  );
}

function AttentionNowCard() {
  const statusConfig = {
    saudavel: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Saudável' },
    atencao: { badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Atenção' },
    risco: { badge: 'bg-red-50 text-red-700 border-red-200', label: 'Risco' },
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <h3 className="font-semibold text-foreground text-sm">Atenção agora</h3>
      </div>

      <div className="space-y-3">
        {mockAttentionCompanies.map((company) => (
          <div key={company.ticker} className="p-3 bg-muted rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-medium text-foreground text-sm">{company.ticker}</span>
                <p className="text-xs text-muted-foreground">{company.companyName}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig[company.status].badge}`}>
                {statusConfig[company.status].label}
              </span>
            </div>
            <p className="text-xs text-dim mb-2">{company.reason}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{pillarLabels[company.pillar]}</span>
              <button className="text-xs font-medium text-brand-text hover:text-brand transition-colors">
                Abrir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-600" />
          <h3 className="font-semibold text-foreground text-sm">Alertas</h3>
        </div>
        <span className="text-xs text-muted-foreground">7 dias</span>
      </div>

      {/* Triggered Alerts */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Disparados</h4>
        <div className="space-y-2">
          {mockActiveAlerts.map((alert) => (
            <div key={alert.id} className="p-3 bg-danger-surface border border-danger-border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-danger-text shrink-0" />
                  <span className="font-medium text-foreground text-xs">{alert.ticker}</span>
                </div>
                <span className="text-xs text-muted-foreground">{alert.triggeredAt}</span>
              </div>
              <p className="text-xs text-dim">{alert.condition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-3">
        <span className="text-xs text-dim">Alertas ativos</span>
        <span className="text-sm font-semibold text-foreground">7</span>
      </div>

      {/* Ver todos */}
      <Link
        href="/notifications"
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-brand hover:bg-brand-surface transition-colors mb-2"
      >
        <span>Ver todos os alertas</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>

      {/* CTA */}
      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-foreground hover:opacity-90 text-card rounded-lg text-xs font-medium transition-colors">
        <Plus className="w-3.5 h-3.5" />
        Criar alerta
      </button>
    </div>
  );
}

function DataQualityCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-4 h-4 text-purple-600" />
        <h3 className="font-semibold text-foreground text-sm">Qualidade dos dados</h3>
      </div>

      <div className="space-y-3 mb-4">
        {mockDataQualityWarnings.map((warning, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl border ${
              warning.severity === 'warning'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <span className={`text-xs font-medium ${
                warning.severity === 'warning' ? 'text-amber-700' : 'text-blue-700'
              }`}>
                {warning.affectedCount} {warning.severity === 'warning' ? 'avisos' : 'notificações'}
              </span>
            </div>
            <p className="text-xs text-dim">{warning.message}</p>
          </div>
        ))}
      </div>

      <button className="text-xs font-medium text-brand-text hover:text-brand transition-colors">
        Ver detalhes †’
      </button>
    </div>
  );
}

function ShortcutsCard() {
  const shortcuts = [
    { icon: ArrowRight, label: 'Continuar de onde parei', enabled: true },
    { icon: Eye, label: 'Abrir watchlist', enabled: true },
    { icon: Compass, label: 'Explorar', enabled: true },
    { icon: GitCompare, label: 'Comparar', enabled: false },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-foreground text-sm mb-4">Atalhos</h3>

      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => {
          const Icon = shortcut.icon;
          return (
            <button
              key={index}
              disabled={!shortcut.enabled}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                shortcut.enabled
                  ? 'text-foreground hover:bg-hover'
                  : 'text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{shortcut.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

