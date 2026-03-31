"use client";

import { Compass, GitCompare, Bell, Play, Eye, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function QuickActionCards() {
  const actions = [
    {
      icon: Compass,
      title: 'Explorar empresas',
      description: 'Descobrir oportunidades com filtros avançados',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/explorar',
    },
    {
      icon: GitCompare,
      title: 'Comparar empresas',
      description: 'Análise lado a lado de múltiplas ações',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      href: '#',
    },
    {
      icon: Bell,
      title: 'Criar alerta',
      description: 'Seja notificado sobre mudanças importantes',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      href: '#',
    },
    {
      icon: Play,
      title: 'Abrir demo (WEGE3)',
      description: 'Ver análise completa de exemplo',
      iconBg: 'bg-mint-50',
      iconColor: 'text-mint-600',
      href: '/empresa/WEGE3',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link
            key={index}
            href={action.href}
            onClick={action.href === '#' ? (e) => e.preventDefault() : undefined}
            className="bg-card border border-border rounded-xl p-4 hover:border-border-strong hover:shadow-sm transition-[border-color,box-shadow] text-left group block"
          >
            <div className={`w-9 h-9 rounded-lg ${action.iconBg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
              <Icon className={`w-4 h-4 ${action.iconColor}`} />
            </div>
            <h3 className="font-medium text-foreground mb-1 text-sm">{action.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}

export function KPICards() {
  const kpis = [
    {
      title: 'Watchlist',
      value: '12',
      context: 'empresas acompanhadas',
      icon: Eye,
      trend: null,
    },
    {
      title: 'Mudanças',
      value: '18',
      context: 'relevantes nos últimos 7 dias',
      icon: TrendingUp,
      trend: '+3 vs semana anterior',
    },
    {
      title: 'Alertas',
      value: '7',
      context: 'ativos · 2 dispararam hoje',
      icon: Bell,
      trend: null,
    },
    {
      title: 'Atenção/Risco',
      value: '3/12',
      context: 'na sua watchlist',
      icon: AlertTriangle,
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{kpi.title}</span>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mb-1">
              <span className="text-2xl font-semibold text-foreground">{kpi.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{kpi.context}</p>
            {kpi.trend && (
              <div className="flex items-center gap-1 text-xs text-success-text">
                <ArrowRight className="w-3 h-3" />
                <span>{kpi.trend}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
