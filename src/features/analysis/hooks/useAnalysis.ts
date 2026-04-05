import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AnalysisData } from '../interfaces';
import type { SectionName } from '../services';
import { fetchAnalysisCoreData, fetchAnalysisSection } from '../services';
import { useAuth } from '@/src/features/auth';

// In-memory caches so revisiting a ticker is instant
const dataCache = new Map<string, AnalysisData>();
const loadedSections = new Map<string, Set<SectionName>>();

export function useAnalysis(ticker: string) {
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<AnalysisData | null>(() => dataCache.get(ticker) ?? null);
  const [loading, setLoading] = useState(!dataCache.has(ticker));
  const [error, setError] = useState<string | null>(null);
  const [sectionsLoaded, setSectionsLoaded] = useState<Set<SectionName>>(
    () => loadedSections.get(ticker) ?? new Set()
  );
  const prevTicker = useRef(ticker);
  const fetchingRef = useRef(new Set<string>());

  // Phase 1: fetch core data on mount / ticker change
  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;

    // Ticker changed — check cache or reset
    if (prevTicker.current !== ticker) {
      prevTicker.current = ticker;
      const cached = dataCache.get(ticker);
      if (cached) {
        setData(cached);
        setLoading(false);
        setError(null);
        setSectionsLoaded(loadedSections.get(ticker) ?? new Set());
        return;
      }
      setData(null);
      setLoading(true);
      setError(null);
      setSectionsLoaded(new Set());
    }

    // If already cached from a previous visit, skip fetch
    if (dataCache.has(ticker)) return;

    fetchAnalysisCoreData(ticker, token)
      .then(coreResult => {
        if (cancelled) return;
        const partial = coreResult as AnalysisData;
        dataCache.set(ticker, partial);
        setData(partial);
        setLoading(false);

        const canonical = coreResult.company?.ticker?.toUpperCase();
        if (canonical && canonical !== ticker) {
          dataCache.set(canonical, partial);
          router.replace(`/analysis/${canonical}`);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[useAnalysis] core fetch failed:', err);
          setError('Não foi possível carregar a análise. Tente novamente mais tarde.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [ticker, token, router]);

  // Phase 2: fetch a section on demand (called when user scrolls to it)
  const fetchSection = useCallback((section: SectionName) => {
    const key = `${ticker}:${section}`;

    // Already loaded or currently fetching
    if (sectionsLoaded.has(section) || fetchingRef.current.has(key)) return;
    fetchingRef.current.add(key);

    fetchAnalysisSection(ticker, section, token)
      .then(sectionData => {
        fetchingRef.current.delete(key);

        // Merge section data into existing data
        setData(prev => {
          if (!prev) return prev;
          const merged = { ...prev, ...sectionData } as AnalysisData;
          dataCache.set(ticker, merged);
          const canonical = prev.company?.ticker?.toUpperCase();
          if (canonical && canonical !== ticker) dataCache.set(canonical, merged);
          return merged;
        });

        // Track loaded section
        setSectionsLoaded(prev => {
          const next = new Set(prev);
          next.add(section);
          loadedSections.set(ticker, next);
          return next;
        });
      })
      .catch(err => {
        fetchingRef.current.delete(key);
        console.error(`[useAnalysis] section ${section} fetch failed:`, err);
      });
  }, [ticker, token, sectionsLoaded]);

  return { data, loading, error, sectionsLoaded, fetchSection, setData, setLoading, setError };
}
