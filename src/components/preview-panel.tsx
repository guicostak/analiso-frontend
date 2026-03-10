import { Company } from '../data/mock-companies';
import { PillarRadar } from './pillar-radar';
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Minus, Bookmark, Bell, GitCompare, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PreviewPanelProps {
  company: Company | null;
}

export function PreviewPanel({ company }: PreviewPanelProps) {
  if (!company) {
    return (
      <div className="sticky top-6 bg-white border border-neutral-200 rounded-3xl p-8 h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 mx-auto mb-4 flex items-center justify-center">
            <GitCompare className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500">Select a company to preview analysis</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={company.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-6 bg-white border border-neutral-200 rounded-3xl p-8 h-[calc(100vh-120px)] overflow-y-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="font-semibold text-2xl text-neutral-900 mb-1">{company.name}</h2>
            <p className="text-neutral-500">{company.ticker} · {company.sector}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            company.status === 'healthy'
              ? 'bg-emerald-50 text-emerald-700'
              : company.status === 'attention'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Quick Diagnosis */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
          Quick Diagnosis
        </h3>
        <div className="space-y-3">
          {company.diagnosis.strengths.map((strength, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-neutral-700">{strength}</p>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-neutral-700">{company.diagnosis.watchout}</p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
          5-Pillar Assessment
        </h3>
        <div className="bg-neutral-50 rounded-2xl p-4">
          <PillarRadar pillars={company.pillars} />
        </div>
      </div>

      {/* Recent Changes */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
          What Changed Since Last Visit
        </h3>
        <div className="space-y-3">
          {company.recentChanges.map((change, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                {change.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : change.direction === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <Minus className="w-4 h-4 text-neutral-400" />
                )}
                <span className="text-sm text-neutral-700">{change.metric}</span>
              </div>
              <span className="text-sm font-medium text-neutral-900">{change.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-6 border-t border-neutral-200">
        <button className="w-full bg-mint-500 hover:bg-mint-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
          Open Full Analysis
          <ArrowRight className="w-4 h-4" />
        </button>
        <div className="grid grid-cols-3 gap-2">
          <button className="py-2.5 border border-neutral-200 hover:border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5">
            <Bookmark className="w-4 h-4" />
            Save
          </button>
          <button className="py-2.5 border border-neutral-200 hover:border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5">
            <Bell className="w-4 h-4" />
            Alert
          </button>
          <button className="py-2.5 border border-neutral-200 hover:border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5">
            <GitCompare className="w-4 h-4" />
            Compare
          </button>
        </div>
      </div>
    </motion.div>
  );
}

