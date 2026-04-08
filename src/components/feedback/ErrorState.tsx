import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorStateProps {
  /** Optional title. Defaults to a generic friendly heading. */
  title?: string;
  /** Optional description. Defaults to a generic friendly explanation. */
  description?: string;
  /** When provided, renders a "Tentar novamente" button that calls this. */
  onRetry?: () => void;
  /** Custom retry button label. */
  retryLabel?: string;
  /** When true, fills the viewport. When false, fits its container. */
  fullScreen?: boolean;
}

export function ErrorState({
  title = 'Não foi possível carregar',
  description = 'Encontramos um problema ao buscar essas informações. Isso pode ser temporário — tente novamente em instantes.',
  onRetry,
  retryLabel = 'Tentar Novamente',
  fullScreen = true,
}: ErrorStateProps) {
  const wrapperClass = fullScreen
    ? 'min-h-screen bg-neutral-50 flex items-center justify-center'
    : 'w-full flex items-center justify-center py-12';

  return (
    <div className={wrapperClass}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-100 mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-600 mb-6">{description}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-mint-500 hover:bg-mint-600 text-white rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </button>
        )}
      </motion.div>
    </div>
  );
}
