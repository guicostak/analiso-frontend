import { useState, useRef, useEffect, useCallback } from 'react';
import type { AnalysisTab } from '../interfaces';

const SECTION_IDS = ['overview', 'value', 'future', 'past', 'health', 'dividend', 'sources'] as const;

export function useAnalysisNav(hasData: boolean) {
  const [activeSection, setActiveSection] = useState<AnalysisTab>('overview');
  const [companyCardPassed, setCompanyCardPassed] = useState(false);
  const companyCardRef = useRef<HTMLDivElement | null>(null);
  const navAlignRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>(
    Object.fromEntries(SECTION_IDS.map(id => [id, null]))
  );

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
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: `-${TOPBAR_H}px 0px -80% 0px`, threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [hasData]);

  const scrollToSection = useCallback((id: AnalysisTab) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const TOPBAR_H = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - TOPBAR_H - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return { activeSection, companyCardPassed, companyCardRef, navAlignRef, sectionRefs, scrollToSection };
}
