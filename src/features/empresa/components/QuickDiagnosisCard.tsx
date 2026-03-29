"use client";

import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { motion } from 'motion/react';

interface QuickDiagnosisCardProps {
  strengths: Array<{
    icon: string;
    title: string;
    metric: string;
    description: string;
  }>;
  watchouts: Array<{
    icon: string;
    title: string;
    metric: string;
    description: string;
  }>;
  lastVisit: {
    metric: string;
    change: string;
    direction: 'up' | 'down' | 'neutral';
    context: string;
  };
}

export function QuickDiagnosisCard({ strengths, watchouts, lastVisit }: QuickDiagnosisCardProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-8">
      <div className="mb-6">
        <h3 className="text-foreground mb-1">Diagnóstico Rápido</h3>
        <p className="text-sm text-muted-foreground">Principais insights em um olhar</p>
      </div>

      {/* Strengths */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Pontos Fortes
        </h4>
        <div className="space-y-4">
          {strengths.map((strength, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-foreground">{strength.title}</span>
                  <span className="text-sm font-semibold text-emerald-600">{strength.metric}</span>
                </div>
                <p className="text-sm text-dim">{strength.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Watchouts */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Pontos de Atenção
        </h4>
        <div className="space-y-4">
          {watchouts.map((watchout, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (strengths.length + index) * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-foreground">{watchout.title}</span>
                  <span className="text-sm font-semibold text-amber-600">{watchout.metric}</span>
                </div>
                <p className="text-sm text-dim">{watchout.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What Changed */}
      <div className="pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          O Que Mudou Desde Sua Última Visita
        </h4>
        <div className="bg-mint-50 border border-mint-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-mint-100 flex items-center justify-center flex-shrink-0">
              {lastVisit.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-mint-700" />
              ) : (
                <TrendingDown className="w-4 h-4 text-mint-700" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-foreground">{lastVisit.metric}</span>
                <span className="text-sm font-semibold text-mint-700">{lastVisit.change}</span>
              </div>
              <p className="text-sm text-dim mb-3">{lastVisit.context}</p>
              <Button variant="link-mint" className="flex items-center gap-1">
                Ver linha do tempo completa
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

