import { Building2, Target, Shield, TrendingUp } from 'lucide-react';

interface BusinessSectionProps {
  description: string;
  model: string;
  moat: string;
  keyDrivers: string[];
}

export function BusinessSection({ description, model, moat, keyDrivers }: BusinessSectionProps) {
  return (
    <section id="business" className="scroll-mt-32">
      <div className="mb-6">
        <h2 className="text-neutral-900 mb-2">Visão Geral do Negócio</h2>
        <p className="text-neutral-600">Entendendo as operações e posição competitiva da empresa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Description */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-neutral-600" />
            </div>
            <h3 className="font-semibold text-neutral-900">O Que Fazem</h3>
          </div>
          <p className="text-neutral-700 leading-relaxed">{description}</p>
        </div>

        {/* Business Model */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-neutral-600" />
            </div>
            <h3 className="font-semibold text-neutral-900">Modelo de Negócio</h3>
          </div>
          <p className="text-neutral-700 leading-relaxed">{model}</p>
        </div>

        {/* Competitive Moat */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-mint-600" />
            </div>
            <h3 className="font-semibold text-neutral-900">Vantagens Competitivas</h3>
          </div>
          <p className="text-neutral-700 leading-relaxed">{moat}</p>
          <div className="mt-4 p-3 bg-mint-50 border border-mint-200 rounded-xl">
            <p className="text-xs text-mint-700 font-medium">
              Vantagens competitivas fortes indicam sustentabilidade de longo prazo
            </p>
          </div>
        </div>

        {/* Key Drivers */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-neutral-600" />
            </div>
            <h3 className="font-semibold text-neutral-900">Principais Direcionadores</h3>
          </div>
          <ul className="space-y-3">
            {keyDrivers.map((driver, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-neutral-600">{index + 1}</span>
                </div>
                <span className="text-neutral-700 leading-relaxed">{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
