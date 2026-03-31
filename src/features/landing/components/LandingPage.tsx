"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/src/features/auth/AuthContext";
import { LandingNav } from "@/src/components/layout/LandingNav";

export function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/painel");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-card text-foreground" style={{ fontSize: '16px' }}>
      <LandingNav />
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
