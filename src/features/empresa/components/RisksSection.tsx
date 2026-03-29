import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RisksSectionProps {
  risks: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    mitigation?: string;
  }>;
}

export function RisksSection({ risks }: RisksSectionProps) {
  const severityConfig = {
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Alto' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Médio' },
    low: { bg: 'bg-muted', border: 'border-border', text: 'text-dim', label: 'Baixo' },
  };

  return (
    <section id="risks" className="scroll-mt-32">
      <div className="mb-6">
        <h2 className="text-foreground mb-2">Riscos & Cenários</h2>
        <p className="text-dim">Principais riscos a monitorar e estratégias de mitigação da gestão</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {risks.map((risk, index) => {
          const config = severityConfig[risk.severity];
          return (
            <div key={index} className="bg-card border border-border rounded-3xl p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <AlertTriangle className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{risk.category}</h3>
                    <p className="text-sm text-muted-foreground">Exposição ao risco</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}>
                  {config.label}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Descrição
                </h4>
                <p className="text-dim leading-relaxed">{risk.description}</p>
              </div>

              {risk.mitigation && (
                <div className="p-4 bg-mint-50 border border-mint-200 rounded-2xl">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0 mt-0.5" />
                    <h4 className="text-sm font-medium text-foreground">Mitigação</h4>
                  </div>
                  <p className="text-sm text-dim leading-relaxed">{risk.mitigation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-6 bg-muted border border-border rounded-3xl">
        <p className="text-sm text-dim">
          <span className="font-medium text-foreground">Metodologia de Avaliação de Riscos:</span> Os riscos são
          avaliados com base no impacto potencial nos lucros, solidez do balanço e posição competitiva.
          As classificações de severidade refletem tanto a probabilidade quanto a magnitude potencial de resultados adversos.
        </p>
      </div>
    </section>
  );
}
