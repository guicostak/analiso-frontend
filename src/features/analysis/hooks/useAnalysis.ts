import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { AnalysisData } from '../interfaces';
import type { SectionName } from '../services';
import { fetchAnalysisCoreData, fetchAnalysisSection } from '../services';
import { useAuth } from '@/src/features/auth';
import { normalizeApiError } from '@/src/lib/errors';

// In-memory caches so revisiting a ticker is instant
const dataCache = new Map<string, AnalysisData>();
const loadedSections = new Map<string, Set<SectionName>>();

// Sections in the order they appear on the page. Used as the default
// prefetch order once the core payload has arrived.
const SECTION_ORDER: SectionName[] = ['value', 'future', 'past', 'health', 'dividend'];

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

  // Sequential prefetch queue — processed one section at a time so we
  // never fan out a burst of parallel requests when the user scrolls fast.
  const queueRef = useRef<SectionName[]>([]);
  const inFlightRef = useRef<SectionName | null>(null);
  const sectionsLoadedRef = useRef<Set<SectionName>>(sectionsLoaded);
  useEffect(() => { sectionsLoadedRef.current = sectionsLoaded; }, [sectionsLoaded]);

  // Process the next item in the queue. Re-entrant safe: if a fetch is
  // already in flight, returns immediately and the running worker will
  // pick up the (possibly reordered) queue when its current fetch finishes.
  const processQueue = useCallback(() => {
    if (inFlightRef.current) return;
    // Drop already-loaded sections from the head of the queue
    while (queueRef.current.length > 0 && sectionsLoadedRef.current.has(queueRef.current[0])) {
      queueRef.current.shift();
    }
    const next = queueRef.current.shift();
    if (!next) return;

    inFlightRef.current = next;
    fetchAnalysisSection(ticker, next, token)
      .then(sectionData => {
        // Merge section data into existing data.
        // Smart merge: never replace a non-empty array from the core data with an
        // empty array that is just a normalizer default from the section response.
        setData(prev => {
          if (!prev) return prev;
          const merged: AnalysisData = { ...prev };
          for (const [key, val] of Object.entries(sectionData as object)) {
            const existing = (prev as Record<string, unknown>)[key];
            if (
              Array.isArray(val) && val.length === 0 &&
              Array.isArray(existing) && existing.length > 0
            ) {
              continue; // keep the richer array already in state
            }
            (merged as Record<string, unknown>)[key] = val;
          }
          dataCache.set(ticker, merged);
          const canonical = prev.company?.ticker?.toUpperCase();
          if (canonical && canonical !== ticker) dataCache.set(canonical, merged);
          return merged;
        });

        // Track loaded section
        setSectionsLoaded(prev => {
          const nextSet = new Set(prev);
          nextSet.add(next);
          loadedSections.set(ticker, nextSet);
          sectionsLoadedRef.current = nextSet;
          return nextSet;
        });
      })
      .catch(err => {
        console.error(`[useAnalysis] section ${next} fetch failed:`, err);
        // Mark the failed section as "loaded" so its skeleton stops spinning
        // forever — the section UI will render whatever defaults the core
        // payload has, and the user gets a discreet toast instead of being
        // stuck on a loading state. The user can still hard-refresh to retry.
        setSectionsLoaded(prev => {
          const nextSet = new Set(prev);
          nextSet.add(next);
          loadedSections.set(ticker, nextSet);
          sectionsLoadedRef.current = nextSet;
          return nextSet;
        });
        toast.error(`Não foi possível carregar parte da análise. ${normalizeApiError(err).message}`);
      })
      .finally(() => {
        inFlightRef.current = null;
        // Continue draining the queue
        processQueue();
      });
  }, [ticker, token]);

  // Phase 1: fetch core data on mount / ticker change
  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;

    // Reset queue state when ticker changes
    queueRef.current = [];
    inFlightRef.current = null;

    // Ticker changed — check cache or reset
    if (prevTicker.current !== ticker) {
      prevTicker.current = ticker;
      const cached = dataCache.get(ticker);
      if (cached) {
        setData(cached);
        setLoading(false);
        setError(null);
        const cachedSections = loadedSections.get(ticker) ?? new Set<SectionName>();
        setSectionsLoaded(cachedSections);
        sectionsLoadedRef.current = cachedSections;
        // Kick off background prefetch for any sections still missing
        queueRef.current = SECTION_ORDER.filter(s => !cachedSections.has(s));
        processQueue();
        return;
      }
      setData(null);
      setLoading(true);
      setError(null);
      const empty = new Set<SectionName>();
      setSectionsLoaded(empty);
      sectionsLoadedRef.current = empty;
    }

    // If already cached from a previous visit, just kick off prefetch and skip
    if (dataCache.has(ticker)) {
      const cachedSections = loadedSections.get(ticker) ?? new Set<SectionName>();
      queueRef.current = SECTION_ORDER.filter(s => !cachedSections.has(s));
      processQueue();
      return;
    }

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

        // Phase 2: start sequential prefetch of all sections in page order.
        // The user can promote a section to the front of the queue by
        // calling fetchSection (e.g. via the IntersectionObserver or nav click).
        queueRef.current = [...SECTION_ORDER];
        processQueue();
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[useAnalysis] core fetch failed:', err);
          setError(normalizeApiError(err).message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [ticker, token, router, processQueue]);

  // Promote a section to the front of the queue. Called by the page when a
  // section enters the viewport or the user clicks a nav item. If the section
  // is already loaded or currently in flight, this is a no-op (the running
  // worker will continue with whatever order is in the queue).
  const fetchSection = useCallback((section: SectionName) => {
    if (sectionsLoadedRef.current.has(section)) return;
    if (inFlightRef.current === section) return;
    // Move to the front of the queue (and ensure it's in the queue)
    queueRef.current = [section, ...queueRef.current.filter(s => s !== section)];
    processQueue();
  }, [processQueue]);

  // Force-load every section sequentially and resolve only when all are loaded.
  // Used by features that need the complete dataset (e.g. PDF export).
  const ensureAllSectionsLoaded = useCallback(async (): Promise<AnalysisData | null> => {
    for (const section of SECTION_ORDER) {
      if (sectionsLoadedRef.current.has(section)) continue;
      try {
        const sectionData = await fetchAnalysisSection(ticker, section, token);
        setData(prev => {
          if (!prev) return prev;
          const merged: AnalysisData = { ...prev };
          for (const [key, val] of Object.entries(sectionData as object)) {
            const existing = (prev as Record<string, unknown>)[key];
            if (
              Array.isArray(val) && val.length === 0 &&
              Array.isArray(existing) && existing.length > 0
            ) continue;
            (merged as Record<string, unknown>)[key] = val;
          }
          dataCache.set(ticker, merged);
          return merged;
        });
        setSectionsLoaded(prev => {
          const nextSet = new Set(prev);
          nextSet.add(section);
          loadedSections.set(ticker, nextSet);
          sectionsLoadedRef.current = nextSet;
          return nextSet;
        });
      } catch (err) {
        console.error(`[useAnalysis] ensureAll: ${section} failed`, err);
      }
    }
    return dataCache.get(ticker) ?? null;
  }, [ticker, token]);

  return { data, loading, error, sectionsLoaded, fetchSection, ensureAllSectionsLoaded, setData, setLoading, setError };
}
