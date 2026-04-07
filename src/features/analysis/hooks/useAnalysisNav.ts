import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AnalysisTab } from '../interfaces';

const SECTION_IDS = ['overview', 'value', 'future', 'past', 'health', 'dividend', 'sources'] as const;
const VALID_TABS = new Set<string>(SECTION_IDS);

/**
 * Atualiza `?tab=` na URL sem re-renderizar a página.
 *
 * Usamos `history.replaceState` em vez de `router.replace` porque o Next.js
 * App Router dispara re-render + refetch em navegação mesmo com shallow
 * routing, e aqui queremos apenas persistir o estado de leitura.
 *
 * Shareability + refresh resilience sem custo de performance.
 */
function updateTabInUrl(tab: AnalysisTab): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (tab === 'overview') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }
    window.history.replaceState(null, '', url.toString());
  } catch {
    /* noop */
  }
}

export function useAnalysisNav(hasData: boolean) {
  const searchParams = useSearchParams();

  // Lê tab inicial da URL (só no mount). Tabs válidos são as seções.
  const initialTab: AnalysisTab = (() => {
    const fromUrl = searchParams?.get('tab');
    if (fromUrl && VALID_TABS.has(fromUrl)) {
      return fromUrl as AnalysisTab;
    }
    return 'overview';
  })();

  const [activeSection, setActiveSection] = useState<AnalysisTab>(initialTab);
  const [companyCardPassed, setCompanyCardPassed] = useState(false);
  const companyCardRef = useRef<HTMLDivElement | null>(null);
  const navAlignRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>(
    Object.fromEntries(SECTION_IDS.map(id => [id, null]))
  );

  // Flag: não queremos que o scroll inicial (quando entramos via ?tab=)
  // sobrescreva a seção ativa via IntersectionObserver antes de chegarmos lá.
  const initialScrollDoneRef = useRef(initialTab === 'overview');

  // Company card visibility observer
  useEffect(() => {
    if (!companyCardRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setCompanyCardPassed(!entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 }
    );
    obs.observe(companyCardRef.current);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasData]);

  // Section observers — re-run when data loads so refs are populated
  useEffect(() => {
    if (!hasData) return;
    const TOPBAR_H = 64;
    const observers: IntersectionObserver[] = [];
    SECTION_IDS.forEach(id => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Ignora updates enquanto o scroll inicial (via ?tab=) ainda não terminou.
            if (!initialScrollDoneRef.current) return;
            setActiveSection(id);
            updateTabInUrl(id);
          }
        },
        { rootMargin: `-${TOPBAR_H}px 0px -80% 0px`, threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [hasData]);

  // Scroll inicial quando entramos em /analysis/VALE3?tab=value — espera o
  // layout pintar antes de rolar pra posição correta.
  useEffect(() => {
    if (!hasData) return;
    if (initialScrollDoneRef.current) return;
    const id = initialTab;
    // Aguarda as seções montarem
    const rafId = window.requestAnimationFrame(() => {
      const el = sectionRefs.current[id];
      if (el) {
        const TOPBAR_H = 64;
        const top = el.getBoundingClientRect().top + window.scrollY - TOPBAR_H - 16;
        window.scrollTo({ top, behavior: 'auto' });
      }
      // Libera os observers após o scroll inicial terminar
      window.setTimeout(() => {
        initialScrollDoneRef.current = true;
      }, 400);
    });
    return () => window.cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasData]);

  const scrollToSection = useCallback((id: AnalysisTab) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const TOPBAR_H = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - TOPBAR_H - 16;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveSection(id);
    updateTabInUrl(id);
  }, []);

  return { activeSection, companyCardPassed, companyCardRef, navAlignRef, sectionRefs, scrollToSection };
}
