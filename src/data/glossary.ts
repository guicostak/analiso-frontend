export type GlossaryEntry = {
  term: string;
  aliases?: string[];
  whatIs: string;
  why: string;
  howToRead: string;
};

const glossaryEntries: GlossaryEntry[] = [
  {
    term: 'ROE',
    whatIs: 'Retorno sobre o patrimônio líquido.',
    why: 'Mostra a eficiência em gerar lucro para o acionista.',
    howToRead: 'Quanto maior, melhor.',
  },
  {
    term: 'ROIC',
    whatIs: 'Retorno sobre o capital investido.',
    why: 'Indica eficiência do capital alocado no negócio.',
    howToRead: 'Quanto maior, melhor.',
  },
  {
    term: 'EBITDA',
    whatIs: 'Lucro antes de juros, impostos, depreciação e amortização.',
    why: 'Ajuda a comparar desempenho operacional entre empresas.',
    howToRead: 'Quanto maior, melhor.',
  },
  {
    term: 'Dívida Líq./EBITDA',
    aliases: ['Dívida/EBITDA', 'Dívida líquida/EBITDA'],
    whatIs: 'Relação entre dívida líquida e geração de caixa operacional.',
    why: 'Indica quantos anos de EBITDA seriam necessários para pagar a dívida.',
    howToRead: 'Quanto menor, melhor.',
  },
  {
    term: 'Payout',
    whatIs: 'Percentual do lucro distribuído aos acionistas.',
    why: 'Mostra a política de distribuição de proventos.',
    howToRead: 'Quanto maior, melhor (até o limite sustentável).',
  },
  {
    term: 'FCF',
    aliases: ['Fluxo de caixa livre'],
    whatIs: 'Caixa gerado após investimentos essenciais.',
    why: 'Indica capacidade de financiar crescimento e dividendos.',
    howToRead: 'Quanto maior, melhor.',
  },
  {
    term: 'CAPEX',
    aliases: ['Capex'],
    whatIs: 'Investimentos em ativos físicos ou intangíveis.',
    why: 'Afeta crescimento e necessidade de caixa.',
    howToRead: 'Quanto menor, melhor (se não comprometer crescimento).',
  },
  {
    term: 'P/L',
    aliases: ['P/L (Preço/Lucro)'],
    whatIs: 'Preço da ação em relação ao lucro por ação.',
    why: 'Ajuda a comparar valuation entre empresas.',
    howToRead: 'Quanto menor, melhor (com cautela).',
  },
  {
    term: 'LPA',
    whatIs: 'Lucro por ação.',
    why: 'Mostra quanto lucro é gerado por ação.',
    howToRead: 'Quanto maior, melhor.',
  },
  {
    term: 'CAGR',
    aliases: ['taxa composta de crescimento'],
    whatIs: 'Taxa composta de crescimento ao longo do tempo.',
    why: 'Resume o ritmo médio de crescimento.',
    howToRead: 'Quanto maior, melhor.',
  },
  {
    term: 'TTM/12m',
    aliases: ['TTM', '12m', 'Últimos 12 meses'],
    whatIs: 'Acumulado dos últimos 12 meses.',
    why: 'Suaviza efeitos sazonais.',
    howToRead: 'Use para comparar períodos equivalentes.',
  },
  {
    term: 'Mediana do setor',
    aliases: ['Mediana setor', 'mediana do setor', 'mediana 12m'],
    whatIs: 'Valor central de um indicador dentro do setor.',
    why: 'Serve como referência neutra de comparação.',
    howToRead: 'Compare a empresa com a referência.',
  },
];

const normalize = (value: string) => value.toLowerCase().trim();

const glossaryIndex = new Map<string, GlossaryEntry>();
glossaryEntries.forEach((entry) => {
  glossaryIndex.set(normalize(entry.term), entry);
  entry.aliases?.forEach((alias) => glossaryIndex.set(normalize(alias), entry));
});

const glossaryTokens = Array.from(glossaryIndex.keys())
  .map((token) => token)
  .filter((token) => token.length > 0);

export const glossaryData = glossaryEntries;

export const getGlossaryEntry = (term: string) => {
  return glossaryIndex.get(normalize(term));
};

export const getGlossaryTokens = () => glossaryTokens;
