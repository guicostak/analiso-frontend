import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorStateProps {
  onRetry?: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-100 mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-neutral-900 mb-2">Não Foi Possível Carregar a Análise</h3>
        <p className="text-neutral-600 mb-6">
          Encontramos um erro ao carregar os dados da empresa. Isso pode ser devido a um problema de rede
          ou os dados estão temporariamente indisponíveis.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-mint-500 hover:bg-mint-600 text-white rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        )}
      </motion.div>
    </div>
  );
}
