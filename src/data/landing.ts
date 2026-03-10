export type BillingCycle = "mensal" | "anual";

export interface NavLink {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  tag: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface PricingPlan {
  key: "essencial" | "premium" | "ilimitado";
  name: string;
  idealFor: string;
  headline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualHelper: string;
  annualSavings: string;
  helper?: string;
  bullets: string[];
  cta: string;
  ctaHref: string;
  finePrint: string;
}

export interface PainPoint {
  title: string;
  description: string;
}

export interface ComparisonRow {
  feature: string;
  analiso: boolean;
  statusInvest: boolean;
  fundamentus: boolean;
  detail?: string;
}

export interface ProofMetric {
  label: string;
  value: string;
  helper: string;
  source: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const navLinks: NavLink[] = [
  { label: "Início", href: "#inicio" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "FAQ", href: "#faq" },
  { label: "Preços", href: "#planos" },
];

export const dataSources = ["CVM", "B3", "RI"];

export const painPoints: PainPoint[] = [
  {
    title: "Excesso de indicador, pouca decisão",
    description: "Você abre várias telas, cruza dezenas de números e ainda termina sem clareza do que exige ação agora.",
  },
  {
    title: "Tempo gasto em garimpo manual",
    description: "Parte do seu tempo vai para procurar dados e confirmar fonte, não para analisar risco e oportunidade.",
  },
  {
    title: "Mudança relevante passa batida",
    description: "Sem priorização, alertas críticos se misturam com ruído e decisões importantes atrasam.",
  },
];

export const comparisonRows: ComparisonRow[] = [
  {
    feature: "Resumo inicial em linguagem simples",
    analiso: true,
    statusInvest: false,
    fundamentus: false,
    detail: "3 sinais + 2 riscos sem jargao",
  },
  {
    feature: "Priorizacao do que exige acao agora",
    analiso: true,
    statusInvest: false,
    fundamentus: false,
    detail: "Mostra primeiro o que mudou de verdade",
  },
  {
    feature: "Evidencia oficial no mesmo fluxo",
    analiso: true,
    statusInvest: false,
    fundamentus: false,
    detail: "Fonte CVM/B3/RI + data no proprio insight",
  },
  {
    feature: "Detalhe sob demanda sem sair da analise",
    analiso: true,
    statusInvest: false,
    fundamentus: false,
    detail: "Botao Ver evidencia abre contexto sem quebrar fluxo",
  },
  {
    feature: "Watchlist com alertas ativos",
    analiso: true,
    statusInvest: true,
    fundamentus: false,
  },
  {
    feature: "Consulta rapida de indicadores",
    analiso: true,
    statusInvest: true,
    fundamentus: true,
  },
  {
    feature: "Leitura por pilares (Divida, Caixa, Margens...)",
    analiso: true,
    statusInvest: false,
    fundamentus: false,
  },
  {
    feature: "Transparencia: nao e recomendacao",
    analiso: true,
    statusInvest: true,
    fundamentus: true,
  },
];

export const proofMetrics: ProofMetric[] = [
  {
    label: "Tempo médio para revisar uma carteira",
    value: "-68%",
    helper: "de 95 min para 30 min por semana",
    source: "Base beta: usuarios ativos (n=37), jan-fev/2026",
  },
  {
    label: "Decisões com evidência rastreável",
    value: "100%",
    helper: "insights com fonte CVM/B3/RI",
    source: "Base beta: usuarios ativos (n=37), jan-fev/2026",
  },
  {
    label: "Percepção de clareza na rotina",
    value: "4,8/5",
    helper: "média reportada por usuários ativos",
    source: "Base beta: usuarios ativos (n=37), jan-fev/2026",
  },
];

export const features: Feature[] = [
  {
    title: "Resumo Inteligente",
    description:
      "Veja primeiro o que exige ação: mudanças críticas, contexto e próximos passos em uma única leitura.",
    tag: "Análise",
  },
  {
    title: "Pilares Financeiros",
    description:
      "Transformamos dezenas de indicadores em 5 pilares claros: Dívida, Caixa, Margens, Retorno e Proventos.",
    tag: "Dados",
  },
  {
    title: "Alertas em Tempo Real",
    description:
      "Receba alertas quando algo relevante muda, com explicação objetiva do impacto e link de origem.",
    tag: "Alertas",
  },
  {
    title: "Fontes Oficiais",
    description:
      "Todos os dados vêm de CVM, B3 e RI com data, hora e link direto para o documento original.",
    tag: "Confiabilidade",
  },
];

export const steps: Step[] = [
  {
    id: "01",
    title: "Escolha seu nível",
    description:
      "Você começa no modo iniciante ou intermediário e recebe a análise no nível certo de linguagem.",
  },
  {
    id: "02",
    title: "Selecione empresas",
    description:
      "Adicione os ativos da sua watchlist e definimos o que precisa de atenção primeiro.",
  },
  {
    id: "03",
    title: "Receba resumo + evidências",
    description:
      "Você vê resumo em 60s, abre a evidência oficial com um clique e entende sem virar analista.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Eu travava no Status Invest porque não sabia por onde começar. Aqui já vejo 3 sinais e 2 riscos em português simples.",
    name: "Ana Ribeiro",
    role: "Iniciante • 3 meses investindo",
  },
  {
    quote:
      "Antes eu pulava entre vídeo, relatório e planilha. Agora fecho revisão semanal da watchlist em cerca de 30 minutos.",
    name: "Gustavo Martins",
    role: "Intermediario • 2 anos investindo",
  },
  {
    quote:
      "O botão de ver evidência foi o que me convenceu. Eu entendo o resumo e ainda confiro a fonte oficial na hora.",
    name: "Patricia Lima",
    role: "Intermediaria • revisao semanal de carteira",
  },
  {
    quote:
      "Não parece recomendação pronta. É uma explicação clara do que mudou e do que eu preciso olhar com calma.",
    name: "Bruno Teixeira",
    role: "Investidor PF • foco em longo prazo",
  },
  {
    quote:
      "Os pilares me ajudaram a conectar os indicadores sem jargão. Finalmente consigo conversar sobre empresa sem decorar fórmula.",
    name: "Mariana Costa",
    role: "Intermediaria • 1 ano analisando empresas",
  },
  {
    quote:
      "Eu usava Fundamentus para consulta, mas ainda ficava inseguro na interpretação. Aqui eu ganho contexto e prioridade.",
    name: "Rafael Nunes",
    role: "Intermediario • 4 anos investindo",
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "Isso é recomendação de investimento?",
    answer:
      "Não. A Analiso organiza e explica dados para apoiar sua análise. A decisão final é sempre sua.",
  },
  {
    question: "De onde vêm os dados?",
    answer:
      "Usamos fontes oficiais: CVM, B3 e RI das empresas. Cada insight mostra origem e data de atualização.",
  },
  {
    question: "Com que frequência atualiza?",
    answer:
      "As atualizações seguem a publicação oficial de cada fonte. Você sempre vê o carimbo de data em cada evidência.",
  },
  {
    question: "Preciso entender termos técnicos para usar?",
    answer:
      "Não. O fluxo foi desenhado para iniciantes e intermediários, com explicação em linguagem simples e detalhe sob demanda.",
  },
  {
    question: "Como os pilares são calculados?",
    answer:
      "Os pilares consolidam indicadores financeiros em critérios claros de risco e qualidade. O detalhe do cálculo fica disponível na evidência.",
  },
  {
    question: "Funciona para FIIs e BDRs?",
    answer:
      "No momento, o foco principal está em empresas listadas na B3. A cobertura de outros ativos depende do plano e da etapa de produto.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    key: "essencial",
    name: "Essencial",
    idealFor: "Ideal para quem está começando a montar watchlist",
    headline: "Comece com confiança em minutos.",
    monthlyPrice: 19,
    annualPrice: 15,
    annualHelper: "cobrado anualmente",
    annualSavings: "Economia de R$ 48/ano",
    bullets: [
      "Watchlist: até 10 empresas",
      "Alertas: até 10 alertas",
      "Diagnóstico em 60s com 5 pilares (Dívida, Caixa, Margens, Retorno, Proventos)",
      "Dashboard de mudanças (últimos 30 dias)",
      "Fontes oficiais (CVM/B3/RI) com data e rastreabilidade",
    ],
    cta: "Começar grátis",
    ctaHref: "/signup?plan=essencial",
    finePrint: "",
  },
  {
    key: "premium",
    name: "Premium",
    idealFor: "Ideal para rotina semanal de análise com mais profundidade",
    headline: "Acompanhe mudanças que importam, sem ruído.",
    monthlyPrice: 39,
    annualPrice: 31,
    annualHelper: "cobrado anualmente",
    annualSavings: "Economia de R$ 96/ano",
    helper: "Melhor custo-benefício para acompanhar de verdade.",
    bullets: [
      "Watchlist: até 50 empresas",
      "Alertas: até 50 alertas + alertas por pilar e severidade",
      "Dashboard completo: filtros 7d/30d/90d + 'Importantes apenas'",
      "Comparar empresas: até 4 lado a lado",
      "Resumo do dia (em 30s) com o que mudou e por quê",
      "Prioridade de atualização e avisos de frescor por categoria",
    ],
    cta: "Começar grátis",
    ctaHref: "/signup?plan=premium",
    finePrint: "",
  },
  {
    key: "ilimitado",
    name: "Ilimitado",
    idealFor: "Ideal para uso diário e monitoramento intensivo",
    headline: "Para uso intenso e rotinas de estudo e monitoramento.",
    monthlyPrice: 79,
    annualPrice: 63,
    annualHelper: "cobrado anualmente",
    annualSavings: "Economia de R$ 192/ano",
    bullets: [
      "Watchlist: ilimitada",
      "Alertas: ilimitados + por pilar e severidade",
      "Dashboard completo com todos os filtros e períodos",
      "Comparar empresas: ilimitado",
      "Prioridade máxima de atualização",
      "Suporte prioritário",
    ],
    cta: "Começar grátis",
    ctaHref: "/signup?plan=ilimitado",
    finePrint: "",
  },
];
