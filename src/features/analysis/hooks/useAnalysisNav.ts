import { useState, useRef, useEffect, useCallback } from 'react';
import type { AnalysisTab } from '../interfaces';

const SECTION_IDS = ['overview', 'value', 'future', 'past', 'health', 'dividend'] as const;

export function useAnalysisNav(hasData: boolean) {
  const [activeSection, setActiveSection] = useState<AnalysisTab>('overview');
  const [companyCardPassed, setCompanyCardPassed] = useState(false);
  const [sidebarMarginTop, setSidebarMarginTop] = useState(0);
  const companyCardRef = useRef<HTMLDivElement | null>(null);
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

  // Sidebar margin scroll effect
  useEffect(() => {
    const updateMargin = () => {
      const cardEl = companyCardRef.current;
      if (!cardEl) { setSidebarMarginTop(0); return; }
      const cardH = cardEl.offsetHeight;
      const scrollY = window.scrollY;
      const offset = Math.max(0, cardH - scrollY);
      setSidebarMarginTop(offset);
    };
    updateMargin();
    window.addEventListener('scroll', updateMargin, { passive: true });
    window.addEventListener('resize', updateMargin, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateMargin);
      window.removeEventListener('resize', updateMargin);
    };
  }, []);

  // Section observers
  useEffect(() => {
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
  }, []);

  const scrollToSection = useCallback((id: AnalysisTab) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const TOPBAR_H = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - TOPBAR_H - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return { activeSection, companyCardPassed, sidebarMarginTop, companyCardRef, sectionRefs, scrollToSection };
}
