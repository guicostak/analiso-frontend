import type { SubscriptionPlan } from "../interfaces";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "essencial",
    name: "Essencial",
    monthlyInstallments: "",
    price: "R$ 19",
    period: "/ por mes",
    featuresTitle: "",
    features: [
      { label: "Watchlist: até 10 empresas", included: false },
      { label: "Alertas: até 10 alertas", included: true },
      { label: "Diagnóstico em 60s com 5 pilares (Dívida, Caixa, Margens, Retorno, Proventos)", included: true },
      { label: "Dashboard de mudanças (últimos 30 dias)", included: true },
      { label: "Fontes oficiais (CVM/B3/RI) com data e rastreabilidade", included: true },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthlyInstallments: "",
    price: "R$ 39",
    period: "/ por mes",
    badge: "Mais popular",
    highlighted: true,
    featuresTitle: "",
    features: [
      { label: "Watchlist: até 30 empresas", included: false },
      { label: "Alertas: até 50 alertas + alertas por pilar e severidade", included: true },
      { label: "Dashboard completo: filtros 7d/30d/90d + 'Importantes apenas'", included: true },
      { label: "Comparar empresas: até 4 lado a lado", included: true },
      { label: "Resumo do dia (em 30s) com o que mudou e por quê", included: true },
      { label: "Prioridade de atualização e avisos de frescor por categoria", included: true },
    ],
  },
  {
    id: "ilimitado",
    name: "Ilimitado",
    monthlyInstallments: "",
    price: "R$ 79",
    period: "/ por mes",
    featuresTitle: "",
    features: [
      { label: "Watchlist: ilimitada", included: true },
      { label: "Alertas: ilimitados + por pilar e severidade", included: true },
      { label: "Dashboard completo com todos os filtros e períodos", included: true },
      { label: "Comparar empresas: ilimitado", included: true },
      { label: "Prioridade máxima de atualização", included: true },
      { label: "Suporte prioritário", included: true },
    ],
  },
];
