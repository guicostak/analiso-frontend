"use client";

import {
  AnalysisMomentsSection,
  CtaSection,
  DarkCapabilities,
  FaqSection,
  HeroMarqueeSection,
  HeroSection,
  ScrollReveal,
  SolutionSection,
  StepsSection,
} from "./LandingSections";
import { AnalysisFlowSection } from "./AnalysisFlowSection";
import { ReadableCompanySection } from "./ReadableCompanySection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-card text-foreground" style={{ fontSize: '16px' }}>
      <main>
        <HeroSection />
        <ScrollReveal delay={0.02}>
          <HeroMarqueeSection />
        </ScrollReveal>
        <ScrollReveal delay={0.03}>
          <AnalysisMomentsSection />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <SolutionSection />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <StepsSection />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <ReadableCompanySection />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <AnalysisFlowSection />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <DarkCapabilities />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <FaqSection />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <CtaSection />
        </ScrollReveal>
      </main>
    </div>
  );
}
