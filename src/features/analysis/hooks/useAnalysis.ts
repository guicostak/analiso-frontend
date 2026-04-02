import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AnalysisData } from '../interfaces';
import { fetchAnalysisData } from '../services';
import { useAuth } from '@/src/features/auth';

export function useAnalysis(ticker: string) {
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    fetchAnalysisData(ticker, token)
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
          const canonical = result.company?.ticker?.toUpperCase();
          if (canonical && canonical !== ticker) {
            router.replace(`/analysis/${canonical}`);
          }
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[AnalysisPage] fetch failed:', err);
          setError('Não foi possível carregar a análise. Tente novamente mais tarde.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [ticker, token, router]);

  return { data, loading, error, setData, setLoading, setError };
}
