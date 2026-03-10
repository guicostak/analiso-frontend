import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-mint-100 mx-auto mb-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-mint-600 animate-spin" />
        </div>
        <h3 className="text-neutral-900 mb-2">Carregando Análise</h3>
        <p className="text-neutral-500">Reunindo os dados mais recentes...</p>
      </motion.div>
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-3xl p-8 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-neutral-200" />
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 rounded w-32 mb-2" />
            <div className="h-3 bg-neutral-200 rounded w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-neutral-200 rounded w-full" />
          <div className="h-3 bg-neutral-200 rounded w-5/6" />
          <div className="h-3 bg-neutral-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}
