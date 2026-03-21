import { AssistantsShowcaseSection } from "./AssistantsShowcaseSection";
import { AudienceSection } from "./AudienceSection";
import { CtaSection } from "./CtaSection";
import { DarkCapabilitiesSection } from "./DarkCapabilitiesSection";
import { FaqSection } from "./FaqSection";
import { HeroMarqueeSection } from "./HeroMarqueeSection";
import { HeroSection } from "./HeroSection";
import { ReadableCompanyHeroSection } from "./ReadableCompanyHeroSection";
import { ScrollReveal } from "./AnalisoLandingV2Sections";
import { SolutionSection } from "./SolutionSection";
import { StepsSection } from "./StepsSection";

export function AnalisoLandingV2Page() {
  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <main>
        <HeroSection />
        <ScrollReveal delay={0.02}>
          <HeroMarqueeSection />
        </ScrollReveal>
        <ScrollReveal delay={0.03}>
          <AudienceSection />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <SolutionSection />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <StepsSection />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <ReadableCompanyHeroSection />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <AssistantsShowcaseSection />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <DarkCapabilitiesSection />
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
