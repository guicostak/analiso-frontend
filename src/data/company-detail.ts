export interface CompanyDetail {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  lastUpdated: string;
  status: 'healthy' | 'attention' | 'risk';
  
  quickDiagnosis: {
    strengths: Array<{
      icon: string;
      title: string;
      metric: string;
      description: string;
    }>;
    watchouts: Array<{
      icon: string;
      title: string;
      metric: string;
      description: string;
    }>;
    lastVisit: {
      metric: string;
      change: string;
      direction: 'up' | 'down' | 'neutral';
      context: string;
    };
  };

  radar: {
    dimensions: {
      growth: { score: number; trend: 'up' | 'down' | 'stable' };
      profitability: { score: number; trend: 'up' | 'down' | 'stable' };
      debt: { score: number; trend: 'up' | 'down' | 'stable' };
      valuation: { score: number; trend: 'up' | 'down' | 'stable' };
      momentum: { score: number; trend: 'up' | 'down' | 'stable' };
    };
    confidence: number; // 0-100
    lastRefreshed: string;
  };

  signals: {
    financialHealth: {
      status: 'strong' | 'moderate' | 'weak';
      score: number;
      metrics: Array<{ label: string; value: string; trend: number[] }>;
    };
    cashAndDebt: {
      netPosition: number; // positive = net cash, negative = net debt
      netPositionLabel: string;
      debtToEquity: number;
      interestCoverage: number;
      trend: number[];
    };
    profitability: {
      grossMargin: number;
      operatingMargin: number;
      netMargin: number;
      roe: number;
      history: Array<{ quarter: string; margin: number; roe: number }>;
    };
    returns: {
      hasDividend: boolean;
      dividendYield?: number;
      payoutRatio?: number;
      sharebuyback?: number;
      totalReturn?: number;
    };
  };

  business: {
    description: string;
    model: string;
    moat: string;
    keyDrivers: string[];
  };

  risks: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    mitigation?: string;
  }>;
}

export const mockCompanyDetail: CompanyDetail = {
  id: '1',
  name: 'WEG S.A.',
  ticker: 'WEGE3',
  sector: 'Industriais · Equipamentos Elétricos',
  lastUpdated: 'há 2 horas',
  status: 'healthy',
  
  quickDiagnosis: {
    strengths: [
      {
        icon: 'trending-up',
        title: 'Expansão internacional',
        metric: '+28% receita externa',
        description: 'Crescimento acelerado em mercados internacionais, especialmente EUA e Europa',
      },
      {
        icon: 'dollar-sign',
        title: 'Margens consistentes',
        metric: '16,8% EBITDA',
        description: 'Margem EBITDA estável acima de 16% há 8 trimestres consecutivos',
      },
      {
        icon: 'shield-check',
        title: 'Caixa robusto',
        metric: 'R$ 4,2B caixa líquido',
        description: 'Posição de caixa líquido com baixo endividamento e forte geração',
      },
    ],
    watchouts: [
      {
        icon: 'alert-circle',
        title: 'Exposição cambial',
        metric: '65% receita em USD/EUR',
        description: 'Alta exposição a flutuações cambiais impacta resultados consolidados',
      },
      {
        icon: 'users',
        title: 'Ciclo de commodities',
        metric: 'Sensível a metais',
        description: 'Custo de cobre e aço pressionam margens em períodos de alta',
      },
    ],
    lastVisit: {
      metric: 'ROE',
      change: '+2,4 pontos percentuais',
      direction: 'up',
      context: 'Atingiu 22,5%, maior nível dos últimos 5 anos',
    },
  },

  radar: {
    dimensions: {
      growth: { score: 82, trend: 'up' },
      profitability: { score: 88, trend: 'stable' },
      debt: { score: 92, trend: 'up' },
      valuation: { score: 68, trend: 'down' },
      momentum: { score: 78, trend: 'up' },
    },
    confidence: 94,
    lastRefreshed: 'há 2 horas',
  },

  signals: {
    financialHealth: {
      status: 'strong',
      score: 91,
      metrics: [
        { label: 'Liquidez Corrente', value: '2,8x', trend: [2.3, 2.4, 2.6, 2.7, 2.8] },
        { label: 'Liquidez Seca', value: '2,1x', trend: [1.8, 1.9, 2.0, 2.0, 2.1] },
        { label: 'Capital de Giro', value: 'R$ 8,5B', trend: [6800, 7200, 7800, 8100, 8500] },
      ],
    },
    cashAndDebt: {
      netPosition: 4200,
      netPositionLabel: 'R$ 4,2B caixa líquido',
      debtToEquity: 0.18,
      interestCoverage: 42,
      trend: [2800, 3200, 3600, 3900, 4200],
    },
    profitability: {
      grossMargin: 32,
      operatingMargin: 14,
      netMargin: 11,
      roe: 22.5,
      history: [
        { quarter: 'T1 23', margin: 13.2, roe: 20.1 },
        { quarter: 'T2 23', margin: 13.5, roe: 20.8 },
        { quarter: 'T3 23', margin: 13.8, roe: 21.2 },
        { quarter: 'T4 23', margin: 14.1, roe: 21.8 },
        { quarter: 'T1 24', margin: 14.0, roe: 22.5 },
      ],
    },
    returns: {
      hasDividend: true,
      dividendYield: 1.2,
      payoutRatio: 35,
      sharebuyback: 180,
      totalReturn: 24.8,
    },
  },

  business: {
    description: 'A WEG é líder global em equipamentos eletroeletrônicos, atuando em motores elétricos, automação industrial, geração e distribuição de energia, e tintas e vernizes. Opera em mais de 135 países com 40 unidades fabris.',
    model: 'Modelo de negócios diversificado com receitas recorrentes de peças, manutenção e serviços. Mix balanceado entre projetos customizados (40%), produtos de catálogo (35%) e aftermarket (25%). Ciclo de vida médio de produtos de 15-20 anos.',
    moat: 'Vantagens competitivas incluem: escala global com produção local, portfólio completo de soluções integradas, forte marca em mercados industriais, expertise técnico em engenharia elétrica, e relacionamentos de longo prazo com clientes industriais.',
    keyDrivers: [
      'Transição energética e eletrificação industrial',
      'Investimentos em infraestrutura e saneamento',
      'Automação industrial e Indústria 4.0',
      'Nearshoring e reindustrialização global',
      'Regulamentações de eficiência energética',
    ],
  },

  risks: [
    {
      category: 'Commodities',
      severity: 'medium',
      description: 'Exposição a volatilidade de preços de cobre, alumínio e aço que representam ~45% dos custos',
      mitigation: 'Política de hedge cambial e repasse gradual via reajustes de preços trimestrais',
    },
    {
      category: 'Cmbio',
      severity: 'medium',
      description: '65% das receitas em moeda estrangeira expõe resultados a flutuações do dólar e euro',
      mitigation: 'Hedge natural com 58% dos custos também em moeda estrangeira, além de derivativos',
    },
    {
      category: 'Ciclo Econômico',
      severity: 'low',
      description: 'Demanda correlacionada a investimentos industriais e ciclos de capex',
      mitigation: 'Diversificação geográfica e setorial reduz dependência de mercados específicos',
    },
    {
      category: 'Concorrência',
      severity: 'low',
      description: 'Competição com players globais (ABB, Siemens) em segmentos premium',
      mitigation: 'Posicionamento competitivo via custo-benefício e atendimento local ágil',
    },
  ],
};
