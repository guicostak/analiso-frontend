import { Company } from '../data/mock-companies';
import { MiniSparkline } from './mini-sparkline';
import { MiniRadar } from './mini-radar';
import { motion } from 'motion/react';

interface CompanyRowProps {
  company: Company;
  isSelected: boolean;
  onSelect: () => void;
}

export function CompanyRow({ company, isSelected, onSelect }: CompanyRowProps) {
  const statusStyles = {
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    attention: 'bg-amber-50 text-amber-700 border-amber-200',
    risk: 'bg-red-50 text-red-700 border-red-200',
  };

  const monogramBg = {
    healthy: 'bg-emerald-100 text-emerald-700',
    attention: 'bg-amber-100 text-amber-700',
    risk: 'bg-red-100 text-red-700',
  };

  return (
    <motion.button
      onClick={onSelect}
      className={`w-full p-4 rounded-2xl border transition-all text-left ${
        isSelected
          ? 'bg-mint-50 border-mint-300 shadow-md'
          : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
      }`}
      initial={false}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
    >
      <div className="flex items-center gap-4">
        {/* Monogram */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${monogramBg[company.status]} flex-shrink-0`}
        >
          <span className="font-semibold text-lg">{company.ticker.slice(0, 2)}</span>
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900 truncate">{company.name}</h3>
            <span className="text-sm text-neutral-500">{company.ticker}</span>
          </div>
          <p className="text-sm text-neutral-600">{company.reason}</p>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[company.status]} flex-shrink-0`}
        >
          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
        </div>

        {/* Sparkline */}
        <div className="flex-shrink-0">
          <MiniSparkline data={company.sparklineData} status={company.status} />
        </div>

        {/* 5-Pillar Snapshot */}
        <div className="flex-shrink-0">
          <MiniRadar pillars={company.pillars} />
        </div>

        {/* Last Updated */}
        <div className="text-sm text-neutral-500 flex-shrink-0 w-24 text-right">
          {company.lastUpdated}
        </div>
      </div>
    </motion.button>
  );
}
