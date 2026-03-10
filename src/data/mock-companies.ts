export interface Company {
  id: string;
  name: string;
  ticker: string;
  status: 'healthy' | 'attention' | 'risk';
  sector: string;
  size: 'large' | 'mid' | 'small';
  hasDividend: boolean;
  lastUpdated: string;
  reason: string;
  sparklineData: number[];
  pillars: {
    growth: number;
    profitability: number;
    debt: number;
    valuation: number;
    momentum: number;
  };
  diagnosis: {
    strengths: string[];
    watchout: string;
  };
  recentChanges: Array<{
    metric: string;
    change: string;
    direction: 'up' | 'down' | 'neutral';
  }>;
  urgencyScore: number;
}

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechVision Inc',
    ticker: 'TCHV',
    status: 'healthy',
    sector: 'Technology',
    size: 'large',
    hasDividend: true,
    lastUpdated: '2 hours ago',
    reason: 'Revenue growth accelerating',
    sparklineData: [45, 52, 48, 55, 58, 62, 65, 68, 72, 75],
    pillars: {
      growth: 85,
      profitability: 78,
      debt: 72,
      valuation: 65,
      momentum: 88,
    },
    diagnosis: {
      strengths: ['Strong revenue growth trajectory', 'Improving profit margins'],
      watchout: 'P/E ratio trending above sector average',
    },
    recentChanges: [
      { metric: 'Revenue Growth', change: '+12% YoY', direction: 'up' },
      { metric: 'Operating Margin', change: '+3.2%', direction: 'up' },
      { metric: 'P/E Ratio', change: '24.5 †’ 26.8', direction: 'up' },
    ],
    urgencyScore: 8,
  },
  {
    id: '2',
    name: 'GreenEnergy Corp',
    ticker: 'GREN',
    status: 'attention',
    sector: 'Energy',
    size: 'mid',
    hasDividend: true,
    lastUpdated: '5 hours ago',
    reason: 'Debt ratio increased',
    sparklineData: [65, 68, 64, 62, 58, 60, 63, 61, 59, 62],
    pillars: {
      growth: 72,
      profitability: 68,
      debt: 45,
      valuation: 78,
      momentum: 55,
    },
    diagnosis: {
      strengths: ['Attractive valuation', 'Consistent dividend payments'],
      watchout: 'Debt-to-equity ratio increased 15% QoQ',
    },
    recentChanges: [
      { metric: 'Debt/Equity', change: '0.45 †’ 0.52', direction: 'down' },
      { metric: 'Dividend Yield', change: '3.8%', direction: 'neutral' },
      { metric: 'Book Value', change: '+5%', direction: 'up' },
    ],
    urgencyScore: 6,
  },
  {
    id: '3',
    name: 'HealthPlus Systems',
    ticker: 'HLTH',
    status: 'healthy',
    sector: 'Healthcare',
    size: 'large',
    hasDividend: false,
    lastUpdated: '1 day ago',
    reason: 'Strong earnings beat',
    sparklineData: [38, 42, 45, 48, 52, 55, 58, 62, 65, 68],
    pillars: {
      growth: 82,
      profitability: 88,
      debt: 85,
      valuation: 70,
      momentum: 80,
    },
    diagnosis: {
      strengths: ['Exceptional profit margins', 'Low debt levels'],
      watchout: 'Growth rate may face headwinds in Q3',
    },
    recentChanges: [
      { metric: 'EPS', change: '$2.45 (beat by $0.32)', direction: 'up' },
      { metric: 'Net Margin', change: '18.5%', direction: 'up' },
      { metric: 'R&D Spending', change: '+22%', direction: 'up' },
    ],
    urgencyScore: 5,
  },
  {
    id: '4',
    name: 'RetailMax Group',
    ticker: 'RTMX',
    status: 'risk',
    sector: 'Consumer',
    size: 'mid',
    hasDividend: true,
    lastUpdated: '3 hours ago',
    reason: 'FCF dropped significantly',
    sparklineData: [72, 70, 65, 60, 55, 52, 48, 45, 42, 38],
    pillars: {
      growth: 35,
      profitability: 48,
      debt: 52,
      valuation: 82,
      momentum: 28,
    },
    diagnosis: {
      strengths: ['Trading at discount to peers', 'Strong brand recognition'],
      watchout: 'Free cash flow declined 42% YoY',
    },
    recentChanges: [
      { metric: 'Free Cash Flow', change: '-42% YoY', direction: 'down' },
      { metric: 'Same-Store Sales', change: '-8%', direction: 'down' },
      { metric: 'Inventory Days', change: '45 †’ 68', direction: 'down' },
    ],
    urgencyScore: 9,
  },
  {
    id: '5',
    name: 'FinServe Bank',
    ticker: 'FNSV',
    status: 'healthy',
    sector: 'Financial',
    size: 'large',
    hasDividend: true,
    lastUpdated: '6 hours ago',
    reason: 'Credit quality improving',
    sparklineData: [52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
    pillars: {
      growth: 65,
      profitability: 82,
      debt: 68,
      valuation: 75,
      momentum: 72,
    },
    diagnosis: {
      strengths: ['Strong ROE metrics', 'Declining NPL ratio'],
      watchout: 'Interest rate sensitivity remains high',
    },
    recentChanges: [
      { metric: 'NPL Ratio', change: '2.1% †’ 1.6%', direction: 'up' },
      { metric: 'ROE', change: '14.2%', direction: 'up' },
      { metric: 'Net Interest Margin', change: '3.8%', direction: 'neutral' },
    ],
    urgencyScore: 4,
  },
  {
    id: '6',
    name: 'InnovateTech Labs',
    ticker: 'INVT',
    status: 'attention',
    sector: 'Technology',
    size: 'small',
    hasDividend: false,
    lastUpdated: '12 hours ago',
    reason: 'Valuation stretched',
    sparklineData: [28, 32, 38, 45, 52, 58, 62, 68, 72, 75],
    pillars: {
      growth: 92,
      profitability: 55,
      debt: 82,
      valuation: 38,
      momentum: 85,
    },
    diagnosis: {
      strengths: ['Exceptional growth metrics', 'Minimal debt burden'],
      watchout: 'Trading at 15x revenue with negative EBITDA',
    },
    recentChanges: [
      { metric: 'Revenue Growth', change: '+145% YoY', direction: 'up' },
      { metric: 'P/S Ratio', change: '15.2x', direction: 'down' },
      { metric: 'Cash Burn', change: '$45M/quarter', direction: 'down' },
    ],
    urgencyScore: 7,
  },
  {
    id: '7',
    name: 'Manufacturing Pro',
    ticker: 'MNFG',
    status: 'healthy',
    sector: 'Industrial',
    size: 'mid',
    hasDividend: true,
    lastUpdated: '8 hours ago',
    reason: 'Margin expansion',
    sparklineData: [48, 50, 52, 54, 56, 58, 60, 62, 64, 66],
    pillars: {
      growth: 68,
      profitability: 78,
      debt: 72,
      valuation: 80,
      momentum: 70,
    },
    diagnosis: {
      strengths: ['Consistent margin improvement', 'Well-capitalized'],
      watchout: 'Cyclical exposure to global trade',
    },
    recentChanges: [
      { metric: 'Gross Margin', change: '32% †’ 35%', direction: 'up' },
      { metric: 'Order Backlog', change: '+18%', direction: 'up' },
      { metric: 'Capex', change: '$120M planned', direction: 'neutral' },
    ],
    urgencyScore: 3,
  },
  {
    id: '8',
    name: 'CloudScale Networks',
    ticker: 'CLDN',
    status: 'attention',
    sector: 'Technology',
    size: 'mid',
    hasDividend: false,
    lastUpdated: '4 hours ago',
    reason: 'Customer churn rising',
    sparklineData: [68, 70, 72, 70, 68, 65, 62, 60, 58, 56],
    pillars: {
      growth: 58,
      profitability: 72,
      debt: 65,
      valuation: 72,
      momentum: 45,
    },
    diagnosis: {
      strengths: ['Healthy profit margins', 'Reasonable valuation'],
      watchout: 'Net revenue retention dropped to 98%',
    },
    recentChanges: [
      { metric: 'NRR', change: '115% †’ 98%', direction: 'down' },
      { metric: 'Customer Count', change: '-5%', direction: 'down' },
      { metric: 'ARPU', change: '+8%', direction: 'up' },
    ],
    urgencyScore: 7,
  },
];

