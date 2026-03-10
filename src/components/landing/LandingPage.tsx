import {
  comparisonRows,
  faqItems,
  features,
  navLinks,
  pricingPlans,
  steps,
  testimonials,
} from "../../data/landing";
import { AboutAnalisoSection } from "./AboutAnalisoSection";
import { BeginnerInvestSection } from "./BeginnerInvestSection";
import { ComparisonSection } from "./ComparisonSection";
import { ComparisonCtaBanner } from "./ComparisonCtaBanner";
import { CtaSection } from "./CtaSection";
import { FaqSection } from "./FaqSection";
import { FeaturesSection } from "./FeaturesSection";
import { FooterSection } from "./FooterSection";
import { HeroSection } from "./HeroSection";
import { PricingToggleClient } from "./PricingToggleClient";
import { StepsSection } from "./StepsSection";
import { TestimonialsClient } from "./TestimonialsClient";
import { GuidedWorkspaceSection } from "./GuidedWorkspaceSection";
import { InteractivePlatformSection } from "./InteractivePlatformSection";

export function LandingPage() {
  return (
    <div className="landing-theme min-h-screen bg-[#F4F6F9] text-[#0F0F14]">
      <main className="landing-main">
        <HeroSection navLinks={navLinks} />
        <AboutAnalisoSection />
        <BeginnerInvestSection />
        <StepsSection steps={steps} />
        <GuidedWorkspaceSection />
        <InteractivePlatformSection />
        <FeaturesSection features={features} />
        <TestimonialsClient testimonials={testimonials} />
        <PricingToggleClient pricingPlans={pricingPlans} />
        <ComparisonSection comparisonRows={comparisonRows} />
        <ComparisonCtaBanner />
        <FaqSection items={faqItems} />
        <CtaSection />
        <FooterSection />
      </main>
    </div>
  );
}












