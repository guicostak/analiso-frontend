export type ContentBlock =
  | { type: "intro"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "formula"; label: string; expression: string; description?: string }
  | { type: "callout"; variant: "tip" | "warning" | "info"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  publishedAt: string;
  updatedAt?: string;
  keywords: string[];
  content: ContentBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "o-que-e-analise-fundamentalista",
    title: "O que é Análise Fundamentalista? Guia Completo para Iniciantes",
    description:
      "Descubra o que é análise fundamentalista, como funciona, quais indicadores usar e por que é o método preferido de investidores de longo prazo como Warren Buffett.",
    category: "Fundamentos",
    readTime: 7,
    publishedAt: "2024-01-10",
    keywords: [
      "análise fundamentalista",
      "como analisar ações",
      "investir em ações",
      "Warren Buffett",
      "valuation",
      "indicadores fundamentalistas",
    ],
    content: [
      {
        type: "intro",
        text: "A análise fundamentalista é o principal método utilizado por grandes investidores — como Warren Buffett e Peter Lynch — para avaliar se uma ação está cara ou barata em relação ao valor real da empresa. Em vez de observar apenas o gráfico do preço, o investidor fundamentalista estuda os dados financeiros, o modelo de negócio, a gestão e o setor de atuação da companhia.",
      },
      { type: "h2", text: "O que é análise fundamentalista?" },
      {
        type: "p",
        text: "Análise fundamentalista é o processo de avaliar o valor intrínseco de uma empresa por meio do estudo de seus dados financeiros e econômicos. O objetivo é determinar se o preço atual da ação reflete — ou não — o real potencial da companhia.",
      },
      {
        type: "p",
        text: "A premissa central é simples: no longo prazo, o preço de uma ação tende a convergir para o valor real da empresa. Portanto, se você conseguir identificar empresas cujo valor intrínseco supera o preço de mercado, você encontrou uma oportunidade de investimento.",
      },
      { type: "h2", text: "Análise fundamentalista vs. análise técnica" },
      {
        type: "p",
        text: "Muitos iniciantes se perguntam qual método usar. A análise técnica estuda padrões gráficos e o comportamento do preço para prever movimentos futuros — é muito usada por traders de curto prazo. Já a análise fundamentalista é voltada para o longo prazo: o investidor compra um pedaço de uma empresa sólida e espera o mercado reconhecer seu valor.",
      },
      {
        type: "table",
        headers: ["Critério", "Fundamentalista", "Técnica"],
        rows: [
          ["Horizonte", "Longo prazo", "Curto/médio prazo"],
          ["Foco", "Dados financeiros", "Preço e volume"],
          ["Pergunta central", "A empresa vale mais?", "O preço vai subir?"],
          ["Ferramentas", "DRE, balanço, múltiplos", "Gráficos, médias móveis"],
        ],
      },
      { type: "h2", text: "Quais dados a análise fundamentalista avalia?" },
      {
        type: "p",
        text: "A análise fundamentalista parte de duas grandes fontes de informação: os documentos financeiros da empresa (chamados de demonstrações financeiras) e os indicadores calculados a partir deles.",
      },
      {
        type: "h3",
        text: "Demonstrações financeiras",
      },
      {
        type: "ul",
        items: [
          "DRE (Demonstração de Resultado): mostra receitas, custos e lucro ao longo do tempo.",
          "Balanço Patrimonial: fotografia dos ativos, passivos e patrimônio líquido da empresa.",
          "DFC (Demonstração de Fluxo de Caixa): mostra quanto dinheiro entra e sai efetivamente do caixa.",
        ],
      },
      {
        type: "h3",
        text: "Indicadores fundamentalistas",
      },
      {
        type: "ul",
        items: [
          "P/L (Preço/Lucro): quanto o mercado paga por cada real de lucro.",
          "P/VP (Preço/Valor Patrimonial): compara o preço com o valor contábil.",
          "Dividend Yield: rendimento em dividendos em relação ao preço da ação.",
          "ROE (Retorno sobre Patrimônio): eficiência no uso do capital dos acionistas.",
          "ROIC: retorno sobre todo o capital investido na empresa.",
          "Margem Líquida: percentual do lucro sobre a receita total.",
          "Dívida Líquida/EBITDA: nível de endividamento em relação à geração de caixa.",
        ],
      },
      { type: "h2", text: "Como fazer análise fundamentalista passo a passo" },
      {
        type: "ol",
        items: [
          "Entenda o negócio: o que a empresa faz, como ganha dinheiro e qual é a vantagem competitiva.",
          "Analise o setor: o mercado em que atua está crescendo? Há regulação excessiva? Quem são os concorrentes?",
          "Estude os resultados: avalie receita, lucro e margens dos últimos 5 a 10 anos.",
          "Calcule os indicadores: P/L, P/VP, ROE, dívida e outros múltiplos relevantes.",
          "Compare com pares: os múltiplos fazem sentido frente ao setor e aos concorrentes?",
          "Estime o valor intrínseco: use o fluxo de caixa descontado (DCF) ou múltiplos para calcular quanto a empresa deveria valer.",
          "Tome a decisão: se o preço estiver abaixo do valor intrínseco com margem de segurança, pode ser uma boa compra.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "A 'margem de segurança' é um conceito popularizado por Benjamin Graham: comprar apenas quando o preço estiver significativamente abaixo do valor estimado. Isso protege o investidor de erros no cálculo e de imprevistos.",
      },
      { type: "h2", text: "Vantagens da análise fundamentalista" },
      {
        type: "ul",
        items: [
          "Foca no longo prazo, reduzindo o impacto da volatilidade de curto prazo.",
          "Permite identificar empresas subavaliadas antes do mercado.",
          "Alinha o investidor ao crescimento real da empresa (lucros e dividendos).",
          "É o método comprovado pelos maiores investidores da história.",
        ],
      },
      { type: "h2", text: "Limitações da análise fundamentalista" },
      {
        type: "ul",
        items: [
          "Não indica quando comprar: uma ação pode continuar barata por anos.",
          "Exige conhecimento contábil e financeiro para interpretar os dados corretamente.",
          "Os dados passados nem sempre refletem o futuro da empresa.",
          "Em mercados irracionais, o preço pode se afastar muito do valor por longos períodos.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "A Analiso foi criada para tornar a análise fundamentalista acessível a qualquer investidor. Nossa plataforma organiza e interpreta os principais indicadores das empresas listadas na B3, com linguagem clara e sem jargões desnecessários.",
      },
    ],
  },

  {
    slug: "o-que-e-pl-preco-lucro",
    title: "O que é P/L (Preço/Lucro)? Como Calcular e Interpretar",
    description:
      "Aprenda o que é o indicador P/L (Preço/Lucro), como calcular, o que significa um P/L alto ou baixo e quando usar esse múltiplo na análise de ações.",
    category: "Valuation",
    readTime: 5,
    publishedAt: "2024-01-15",
    keywords: [
      "P/L",
      "preço lucro",
      "múltiplo P/L",
      "como calcular PL",
      "PL ação",
      "indicadores fundamentalistas",
    ],
    content: [
      {
        type: "intro",
        text: "O P/L (Preço/Lucro) é o indicador fundamentalista mais popular do mercado de ações. Ele responde a uma pergunta simples: quanto o mercado está disposto a pagar por cada real de lucro que a empresa gera? Entender esse múltiplo é essencial para qualquer investidor que analisa ações na B3.",
      },
      { type: "h2", text: "O que é P/L?" },
      {
        type: "p",
        text: "O P/L, também chamado de Price-to-Earnings (PE ratio) em inglês, é um múltiplo de valuation que compara o preço de mercado de uma ação com o lucro por ação (LPA) da empresa. Quanto maior o P/L, mais caro (em relação ao lucro) o mercado está pagando pela ação.",
      },
      {
        type: "formula",
        label: "P/L",
        expression: "Preço da Ação ÷ Lucro por Ação (LPA)",
        description:
          "O LPA é calculado dividindo o lucro líquido total pelo número de ações em circulação.",
      },
      { type: "h2", text: "Como calcular o P/L na prática" },
      {
        type: "p",
        text: "Suponha que uma ação esteja cotada a R$ 20,00 e a empresa tenha gerado um lucro líquido de R$ 2,00 por ação nos últimos 12 meses. O P/L seria:",
      },
      {
        type: "formula",
        label: "Exemplo",
        expression: "R$ 20,00 ÷ R$ 2,00 = P/L de 10x",
        description:
          "Isso significa que o investidor está pagando 10 anos de lucro pelo valor da ação hoje — ou que, mantendo o lucro constante, levaria 10 anos para 'recuperar' o investimento.",
      },
      { type: "h2", text: "Como interpretar o P/L" },
      {
        type: "p",
        text: "Não existe um P/L 'certo' ou 'errado' universalmente. A interpretação depende do contexto. Em geral:",
      },
      {
        type: "table",
        headers: ["P/L", "Possível interpretação"],
        rows: [
          ["Abaixo de 10x", "Ação potencialmente barata — ou empresa em dificuldades"],
          ["Entre 10x e 20x", "Faixa considerada razoável para empresas maduras"],
          ["Entre 20x e 40x", "Expectativa de crescimento elevado embutida no preço"],
          ["Acima de 40x", "Valuations de empresas de crescimento acelerado ou bolha"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Um P/L baixo nem sempre significa uma barganha. Pode indicar que o mercado antecipa queda nos lucros, problemas na gestão ou deterioração do setor. Sempre analise o contexto.",
      },
      { type: "h2", text: "P/L alto vs. P/L baixo" },
      {
        type: "h3",
        text: "P/L alto",
      },
      {
        type: "p",
        text: "Empresas de crescimento (growth) costumam ter P/L elevado porque os investidores pagam mais pelos lucros futuros esperados. Uma fintech em expansão, por exemplo, pode ter P/L de 60x — o mercado está apostando que os lucros crescerão muito nos próximos anos.",
      },
      {
        type: "h3",
        text: "P/L baixo",
      },
      {
        type: "p",
        text: "Empresas maduras, de setores regulados ou com crescimento lento tendem a ter P/L menor. Utilities (elétrica, saneamento) e bancos frequentemente negociam com P/L entre 8x e 15x. Um P/L baixo combinado com fundamentos sólidos pode ser uma oportunidade.",
      },
      { type: "h2", text: "Limitações do P/L" },
      {
        type: "ul",
        items: [
          "Não funciona quando a empresa tem lucro negativo (P/L indefinido).",
          "O lucro contábil pode ser distorcido por eventos não recorrentes.",
          "Setores diferentes têm P/L médios muito distintos — não compare empresas de setores opostos.",
          "Não considera o crescimento futuro (o PEG ratio tenta corrigir isso).",
          "Empresas alavancadas podem ter lucro inflado pelo efeito da dívida.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Compare o P/L da ação com a média histórica da própria empresa e com o P/L médio do setor. Uma ação com P/L 20% abaixo da sua própria média histórica pode ser um sinal de oportunidade.",
      },
      { type: "h2", text: "P/L e o crescimento: o PEG Ratio" },
      {
        type: "p",
        text: "O PEG Ratio (Price/Earnings to Growth) é uma evolução do P/L que considera a taxa de crescimento do lucro. Divide o P/L pela taxa de crescimento esperada dos lucros. Um PEG abaixo de 1 sugere que a ação pode estar barata em relação ao seu crescimento.",
      },
      {
        type: "formula",
        label: "PEG Ratio",
        expression: "P/L ÷ Taxa de crescimento do lucro (%)",
        description:
          "Ex.: P/L de 20x com crescimento anual de 20% = PEG de 1,0 — considerado justo pelo mercado.",
      },
    ],
  },

  {
    slug: "o-que-e-pvp",
    title: "O que é P/VP (Preço/Valor Patrimonial)? Guia Completo",
    description:
      "Entenda o que é P/VP, como calcular esse indicador, o que significa negociar abaixo do valor patrimonial e como usar o P/VP na análise de ações.",
    category: "Valuation",
    readTime: 5,
    publishedAt: "2024-01-22",
    keywords: [
      "P/VP",
      "preço valor patrimonial",
      "price to book",
      "PVP ação",
      "como calcular PVP",
      "análise de ações",
    ],
    content: [
      {
        type: "intro",
        text: "O P/VP (Preço sobre Valor Patrimonial), conhecido em inglês como Price-to-Book (P/B), é um dos múltiplos de valuation mais utilizados para avaliar se uma ação está cara ou barata em relação ao que a empresa efetivamente possui. É especialmente útil para analisar bancos, seguradoras e outras empresas intensivas em ativos.",
      },
      { type: "h2", text: "O que é P/VP?" },
      {
        type: "p",
        text: "O P/VP compara o preço de mercado de uma ação com o seu valor patrimonial por ação (VPA). O valor patrimonial representa o patrimônio líquido da empresa dividido pelo número de ações — ou seja, o que 'sobra' para os acionistas se todos os ativos fossem vendidos e todas as dívidas pagas.",
      },
      {
        type: "formula",
        label: "P/VP",
        expression: "Preço da Ação ÷ Valor Patrimonial por Ação (VPA)",
        description: "VPA = Patrimônio Líquido ÷ Número de Ações em Circulação",
      },
      { type: "h2", text: "Como calcular o P/VP" },
      {
        type: "p",
        text: "Suponha que uma empresa tenha patrimônio líquido de R$ 1 bilhão e 100 milhões de ações emitidas. O VPA seria R$ 10,00. Se a ação for cotada a R$ 8,00, o P/VP seria 0,8x — a ação está sendo negociada com desconto de 20% sobre o valor contábil.",
      },
      { type: "h2", text: "Como interpretar o P/VP" },
      {
        type: "table",
        headers: ["P/VP", "Interpretação geral"],
        rows: [
          ["Abaixo de 1x", "Ação negociando abaixo do valor contábil (possível oportunidade ou sinal de alerta)"],
          ["Entre 1x e 2x", "Faixa razoável para empresas maduras e setores tradicionais"],
          ["Entre 2x e 5x", "Comum em empresas com alta rentabilidade (ROE elevado)"],
          ["Acima de 5x", "Empresas com forte vantagem competitiva ou de alto crescimento"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Nem sempre P/VP abaixo de 1x é uma barganha. Pode indicar ativos de baixa qualidade, deterioração do negócio ou que o patrimônio contábil superestima o valor real dos ativos. Sempre investigue o motivo.",
      },
      { type: "h2", text: "A relação entre P/VP e ROE" },
      {
        type: "p",
        text: "Existe uma regra de ouro no mercado: empresas com ROE (Retorno sobre Patrimônio) elevado e sustentável merecem negociar com P/VP maior. Isso porque quanto mais a empresa rentabiliza cada real de capital dos acionistas, mais valioso esse capital se torna.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "Uma empresa com ROE de 25% deveria, em tese, negociar com P/VP bem acima de 1x. Se estiver com P/VP próximo de 1x, pode ser uma oportunidade ou um sinal de que o mercado duvida da sustentabilidade do ROE.",
      },
      { type: "h2", text: "Quando usar o P/VP" },
      {
        type: "ul",
        items: [
          "Análise de bancos e seguradoras: o patrimônio líquido é a base do negócio bancário.",
          "Empresas intensivas em ativos: siderúrgicas, mineradoras, utilities.",
          "Comparação entre empresas do mesmo setor.",
          "Identificação de empresas potencialmente subavaliadas.",
        ],
      },
      { type: "h2", text: "Limitações do P/VP" },
      {
        type: "ul",
        items: [
          "Não é útil para empresas de tecnologia ou serviços, cujo valor está nos ativos intangíveis (marcas, patentes, talentos).",
          "O patrimônio contábil pode diferir muito do valor econômico real dos ativos.",
          "Não reflete crescimento futuro.",
          "Empresas com muito goodwill no balanço podem ter VPA distorcido.",
        ],
      },
    ],
  },

  {
    slug: "o-que-e-dividend-yield",
    title: "O que é Dividend Yield? Como Calcular e Usar na Análise de Ações",
    description:
      "Entenda o que é Dividend Yield, como calcular esse indicador, qual é um bom DY e como usá-lo para escolher ações pagadoras de dividendos na B3.",
    category: "Proventos",
    readTime: 5,
    publishedAt: "2024-02-05",
    keywords: [
      "dividend yield",
      "DY",
      "dividendos",
      "ações pagadoras de dividendos",
      "como calcular dividend yield",
      "melhores dividendos B3",
    ],
    content: [
      {
        type: "intro",
        text: "O Dividend Yield (DY) é o indicador que mede o rendimento em dividendos de uma ação em relação ao seu preço de mercado. É o principal critério para investidores que buscam renda passiva por meio de dividendos — e um dos mais pesquisados da B3.",
      },
      { type: "h2", text: "O que é Dividend Yield?" },
      {
        type: "p",
        text: "O Dividend Yield representa o percentual de retorno que um investidor recebe em dividendos ao comprar uma ação pelo preço atual. É calculado dividindo o total de dividendos pagos por ação nos últimos 12 meses pelo preço atual da ação.",
      },
      {
        type: "formula",
        label: "Dividend Yield",
        expression: "(Dividendos por Ação nos últimos 12 meses ÷ Preço da Ação) × 100",
        description: "O resultado é expresso em percentual.",
      },
      { type: "h2", text: "Exemplo prático" },
      {
        type: "p",
        text: "Se uma ação está cotada a R$ 40,00 e pagou R$ 3,20 em dividendos nos últimos 12 meses, o Dividend Yield é:",
      },
      {
        type: "formula",
        label: "Exemplo",
        expression: "(R$ 3,20 ÷ R$ 40,00) × 100 = 8% ao ano",
        description:
          "Isso significa que o investidor recebeu 8% do valor investido de volta em dividendos ao longo do ano.",
      },
      { type: "h2", text: "Qual é um bom Dividend Yield?" },
      {
        type: "p",
        text: "Não há um valor universalmente 'bom', mas alguns parâmetros ajudam a contextualizar:",
      },
      {
        type: "table",
        headers: ["Dividend Yield", "Interpretação"],
        rows: [
          ["Abaixo de 3%", "Baixo — empresa reinveste mais lucro do que distribui"],
          ["Entre 3% e 6%", "Razoável para empresas em crescimento"],
          ["Entre 6% e 10%", "Alto — típico de empresas maduras (utilities, bancos)"],
          ["Acima de 10%", "Muito alto — pode indicar queda recente do preço ou distribuição insustentável"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "DY muito elevado pode ser uma armadilha (dividend trap). Às vezes, o yield sobe não porque a empresa está pagando mais, mas porque o preço da ação caiu — o que pode sinalizar problemas sérios no negócio.",
      },
      { type: "h2", text: "Dividendos no Brasil: a vantagem da isenção" },
      {
        type: "p",
        text: "No Brasil, os dividendos distribuídos por empresas listadas na B3 são isentos de Imposto de Renda para pessoas físicas (regra vigente até 2025). Isso torna as ações pagadoras de dividendos especialmente atraentes para investidores pessoa física.",
      },
      {
        type: "callout",
        variant: "info",
        text: "Juros sobre Capital Próprio (JCP) são tratados de forma diferente: sofrem retenção de 15% de IR na fonte. Fique atento à composição dos proventos pagos pela empresa.",
      },
      { type: "h2", text: "Como analisar a consistência dos dividendos" },
      {
        type: "ul",
        items: [
          "Histórico de pagamentos: a empresa paga dividendos consistentemente há 5, 10 anos?",
          "Payout ratio: percentual do lucro distribuído. Payout acima de 90% pode ser insustentável.",
          "Crescimento dos dividendos: os dividendos por ação crescem junto com o lucro?",
          "Geração de caixa: a empresa tem fluxo de caixa livre suficiente para manter os pagamentos?",
          "Política de dividendos: a empresa tem política clara e previsível de distribuição?",
        ],
      },
      { type: "h2", text: "Dividend Yield vs. outras formas de renda" },
      {
        type: "p",
        text: "É comum comparar o DY das ações com a taxa Selic ou com o rendimento de FIIs (Fundos Imobiliários). Uma ação com DY de 8% em um ambiente de Selic a 10% pode ser menos atrativa que uma com DY de 12%. A análise relativa é importante para definir a alocação do portfólio.",
      },
    ],
  },

  {
    slug: "o-que-e-roe",
    title: "O que é ROE (Retorno sobre Patrimônio Líquido)? Como Calcular",
    description:
      "Aprenda o que é ROE, como calcular o Retorno sobre Patrimônio Líquido, qual é um bom ROE e por que Warren Buffett considera esse indicador essencial.",
    category: "Rentabilidade",
    readTime: 5,
    publishedAt: "2024-02-12",
    keywords: [
      "ROE",
      "retorno sobre patrimônio líquido",
      "return on equity",
      "como calcular ROE",
      "ROE ação",
      "rentabilidade empresa",
    ],
    content: [
      {
        type: "intro",
        text: "O ROE (Return on Equity), ou Retorno sobre Patrimônio Líquido, é um dos indicadores de rentabilidade mais importantes da análise fundamentalista. Ele mede a eficiência com que uma empresa usa o capital dos acionistas para gerar lucro — e é um dos favoritos de Warren Buffett.",
      },
      { type: "h2", text: "O que é ROE?" },
      {
        type: "p",
        text: "O ROE expressa, em percentual, quanto de lucro líquido a empresa gera para cada real de patrimônio líquido. Em outras palavras: se você investiu R$ 100 no patrimônio de uma empresa com ROE de 20%, ela gerou R$ 20 de lucro líquido naquele período.",
      },
      {
        type: "formula",
        label: "ROE",
        expression: "(Lucro Líquido ÷ Patrimônio Líquido Médio) × 100",
        description:
          "Use o patrimônio líquido médio (início + fim do período dividido por 2) para melhor precisão.",
      },
      { type: "h2", text: "Qual é um bom ROE?" },
      {
        type: "table",
        headers: ["ROE", "Interpretação"],
        rows: [
          ["Abaixo de 10%", "Abaixo do custo de capital — empresa destrói valor"],
          ["Entre 10% e 15%", "Razoável — empresa cobre o custo de capital"],
          ["Entre 15% e 25%", "Bom — empresa rentabiliza bem o capital dos acionistas"],
          ["Acima de 25%", "Excelente — sinaliza vantagem competitiva relevante (moat)"],
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Warren Buffett busca empresas com ROE consistentemente acima de 15% por pelo menos 10 anos. A consistência é tão importante quanto o nível do indicador.",
      },
      { type: "h2", text: "Decomposição do ROE: a fórmula DuPont" },
      {
        type: "p",
        text: "A análise DuPont decompõe o ROE em três componentes, revelando de onde vem a rentabilidade da empresa:",
      },
      {
        type: "formula",
        label: "ROE (DuPont)",
        expression: "Margem Líquida × Giro do Ativo × Alavancagem Financeira",
        description:
          "Margem = lucro/receita | Giro = receita/ativo | Alavancagem = ativo/PL",
      },
      {
        type: "ul",
        items: [
          "Margem líquida alta: empresa rentável e com controle de custos.",
          "Giro do ativo alto: empresa eficiente no uso dos seus ativos para gerar receita.",
          "Alavancagem alta: empresa usa dívida para amplificar o retorno — mas aumenta o risco.",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Um ROE elevado gerado principalmente por alavancagem financeira pode ser perigoso. Sempre verifique se o ROE vem da margem e do giro, não apenas da dívida.",
      },
      { type: "h2", text: "ROE vs. ROIC" },
      {
        type: "p",
        text: "Enquanto o ROE mede o retorno sobre o capital dos acionistas, o ROIC (Retorno sobre o Capital Investido) considera também o capital de terceiros (dívidas). O ROIC é considerado uma medida mais completa de eficiência, pois elimina o efeito da alavancagem financeira.",
      },
      { type: "h2", text: "Limitações do ROE" },
      {
        type: "ul",
        items: [
          "Empresas muito alavancadas podem ter ROE artificialmente alto.",
          "Recompras de ações reduzem o patrimônio líquido e elevam o ROE sem criar valor real.",
          "Prejuízos acumulados podem distorcer o patrimônio líquido.",
          "Setores diferentes têm benchmarks de ROE distintos — compare sempre no mesmo setor.",
        ],
      },
    ],
  },

  {
    slug: "o-que-e-ebitda",
    title: "O que é EBITDA? Significado, Cálculo e Como Usar na Análise",
    description:
      "Descubra o que é EBITDA, como calcular, o que representa na análise de empresas e quais as principais críticas a esse indicador amplamente usado.",
    category: "Resultados",
    readTime: 5,
    publishedAt: "2024-02-19",
    keywords: [
      "EBITDA",
      "o que é EBITDA",
      "como calcular EBITDA",
      "EBITDA empresa",
      "análise financeira",
      "geração de caixa",
    ],
    content: [
      {
        type: "intro",
        text: "O EBITDA é um dos termos mais ouvidos no mundo das finanças corporativas — e também um dos mais mal compreendidos. Sigla em inglês para Earnings Before Interest, Taxes, Depreciation and Amortization (Lucro antes de Juros, Impostos, Depreciação e Amortização), o EBITDA é usado como proxy da capacidade operacional de geração de caixa de uma empresa.",
      },
      { type: "h2", text: "O que significa EBITDA?" },
      {
        type: "p",
        text: "O EBITDA representa o resultado operacional de uma empresa antes de efeitos financeiros, fiscais e contábeis. A ideia é mostrar quanto o negócio gera de caixa puramente pelas suas atividades principais, independente de como é financiado (dívida ou capital próprio) ou de decisões contábeis como depreciação.",
      },
      {
        type: "formula",
        label: "EBITDA",
        expression: "Lucro Líquido + Juros + Impostos + Depreciação + Amortização",
        description:
          "Ou, de forma mais direta: EBITDA = Receita Líquida − Custos Operacionais (excluindo D&A)",
      },
      { type: "h2", text: "O que é excluído do EBITDA e por quê?" },
      {
        type: "ul",
        items: [
          "Juros (I): removido para neutralizar o impacto da estrutura de capital (quanto a empresa se financia com dívida vs. capital próprio).",
          "Impostos (T): removido porque a carga tributária varia conforme a jurisdição, não o desempenho operacional.",
          "Depreciação (D) e Amortização (A): são despesas não-caixa — a empresa não desembolsa dinheiro naquele momento.",
        ],
      },
      { type: "h2", text: "Como usar o EBITDA na análise" },
      {
        type: "h3",
        text: "Múltiplo EV/EBITDA",
      },
      {
        type: "p",
        text: "O EV/EBITDA (Enterprise Value / EBITDA) é o múltiplo de valuation mais usado em fusões e aquisições. Compara o valor total da empresa (incluindo dívida) com sua geração operacional de caixa.",
      },
      {
        type: "formula",
        label: "EV/EBITDA",
        expression: "Valor da Empresa (EV) ÷ EBITDA",
        description:
          "EV = Capitalização de Mercado + Dívida Líquida. Quanto menor o múltiplo, mais barata (em tese) a empresa.",
      },
      {
        type: "h3",
        text: "Margem EBITDA",
      },
      {
        type: "p",
        text: "A Margem EBITDA divide o EBITDA pela receita líquida, expressando a eficiência operacional da empresa. Uma empresa com receita de R$ 1 bilhão e EBITDA de R$ 300 milhões tem margem EBITDA de 30%.",
      },
      { type: "h2", text: "Críticas ao EBITDA" },
      {
        type: "p",
        text: "Charlie Munger, parceiro de Warren Buffett, é um dos maiores críticos do EBITDA, chamando-o de 'lucro antes das coisas ruins'. As principais críticas são:",
      },
      {
        type: "ul",
        items: [
          "Ignora o capex (investimentos em ativos fixos), que é um custo real para a empresa.",
          "A depreciação não é 'dinheiro fictício' — ela representa o desgaste real dos ativos que precisarão ser repostos.",
          "Pode ser manipulado por empresas que reclassificam despesas operacionais como amortização.",
          "Não reflete as necessidades de capital de giro do negócio.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "Por isso, muitos analistas preferem o FCFE (Fluxo de Caixa Livre para o Acionista) ou o FCFF (Fluxo de Caixa Livre para a Firma) como medida mais fidedigna da geração real de valor.",
      },
      { type: "h2", text: "EBITDA ajustado" },
      {
        type: "p",
        text: "Muitas empresas divulgam o 'EBITDA Ajustado', que exclui eventos não recorrentes (reestruturações, multas, ganhos de venda de ativos). Embora útil, é importante ler a nota explicativa: algumas companhias usam o ajuste para esconder problemas recorrentes.",
      },
    ],
  },

  {
    slug: "divida-liquida-ebitda",
    title: "Dívida Líquida/EBITDA: Como Avaliar o Endividamento de uma Empresa",
    description:
      "Entenda o que é o índice Dívida Líquida/EBITDA, como calcular, o que significa estar acima ou abaixo de 2x e como usar esse indicador para analisar o risco financeiro de empresas.",
    category: "Endividamento",
    readTime: 5,
    publishedAt: "2024-02-26",
    keywords: [
      "dívida líquida EBITDA",
      "alavancagem financeira",
      "endividamento empresa",
      "como analisar dívida",
      "risco financeiro ação",
    ],
    content: [
      {
        type: "intro",
        text: "O índice Dívida Líquida/EBITDA é o principal indicador usado para avaliar o nível de endividamento de uma empresa em relação à sua capacidade de geração de caixa. Bancos, analistas e agências de rating utilizam esse múltiplo para definir limites de crédito e classificar o risco financeiro de companhias.",
      },
      { type: "h2", text: "O que é Dívida Líquida?" },
      {
        type: "p",
        text: "A Dívida Líquida é a dívida financeira total (empréstimos, debêntures, bonds) menos o caixa e equivalentes disponíveis. Se a empresa tem R$ 500 milhões em dívidas e R$ 200 milhões em caixa, a dívida líquida é R$ 300 milhões.",
      },
      {
        type: "formula",
        label: "Dívida Líquida",
        expression: "Dívida Bruta Total − Caixa e Equivalentes",
        description:
          "Dívida bruta = empréstimos bancários + debêntures + bonds + arrendamentos financeiros.",
      },
      { type: "h2", text: "Como calcular o índice" },
      {
        type: "formula",
        label: "Dívida Líquida / EBITDA",
        expression: "Dívida Líquida ÷ EBITDA dos últimos 12 meses (LTM)",
        description:
          "O resultado indica quantos anos de EBITDA seriam necessários para quitar toda a dívida líquida.",
      },
      { type: "h2", text: "Como interpretar o índice" },
      {
        type: "table",
        headers: ["Dívida Líquida/EBITDA", "Interpretação"],
        rows: [
          ["Negativo", "Empresa com caixa líquido (caixa > dívida) — situação confortável"],
          ["0x a 1,5x", "Baixo endividamento — empresa resiliente"],
          ["1,5x a 3x", "Endividamento moderado — aceitável para setores estáveis"],
          ["3x a 4x", "Endividamento elevado — requer monitoramento"],
          ["Acima de 4x", "Endividamento alto — risco de covenant breach e refinanciamento"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Setores como utilities (elétrica, saneamento) e concessões toleram níveis de alavancagem maiores (4x–6x) devido à previsibilidade das receitas. Já empresas cíclicas (siderurgia, commodities) devem manter dívida mais baixa.",
      },
      { type: "h2", text: "Por que o EBITDA é usado como denominador?" },
      {
        type: "p",
        text: "O EBITDA é usado como proxy da geração de caixa operacional. A lógica é: 'se a empresa parar de investir e de pagar impostos (simplificadamente), em quantos anos consegue quitar sua dívida?' Claro que o EBITDA não é caixa livre — por isso, analistas mais rigorosos preferem usar o FCFO (Fluxo de Caixa das Operações) no denominador.",
      },
      { type: "h2", text: "Covenants de dívida" },
      {
        type: "p",
        text: "Muitos contratos de dívida incluem covenants financeiros — cláusulas que exigem que a empresa mantenha indicadores como Dívida Líquida/EBITDA abaixo de determinado patamar. Se ultrapassar, o banco pode exigir pagamento antecipado ou elevar a taxa de juros.",
      },
      { type: "h2", text: "Análise completa do endividamento" },
      {
        type: "p",
        text: "Além do índice Dívida Líquida/EBITDA, analise também:",
      },
      {
        type: "ul",
        items: [
          "Perfil de vencimentos: quanto da dívida vence no curto prazo (até 1 ano)?",
          "Custo da dívida: a empresa paga CDI+2% ou CDI+8% nas suas dívidas?",
          "Moeda: a dívida é em reais ou em dólares? Dívida em dólar implica risco cambial.",
          "Índice de cobertura de juros (EBIT/Despesa Financeira): a empresa consegue pagar os juros com o lucro operacional?",
          "Liquidez corrente: a empresa tem ativo circulante suficiente para cobrir o passivo circulante?",
        ],
      },
    ],
  },

  {
    slug: "o-que-e-margem-liquida",
    title: "O que é Margem Líquida? Como Calcular e Interpretar",
    description:
      "Saiba o que é Margem Líquida, como calcular esse indicador de lucratividade, o que é uma boa margem e por que ela varia tanto entre diferentes setores.",
    category: "Rentabilidade",
    readTime: 4,
    publishedAt: "2024-03-04",
    keywords: [
      "margem líquida",
      "lucratividade empresa",
      "como calcular margem líquida",
      "análise de lucratividade",
      "indicadores de rentabilidade",
    ],
    content: [
      {
        type: "intro",
        text: "A Margem Líquida é o indicador que revela quanto de cada real de receita a empresa efetivamente converte em lucro para os acionistas. É uma das métricas mais diretas de lucratividade e permite comparar empresas de diferentes tamanhos em igualdade de condições.",
      },
      { type: "h2", text: "O que é Margem Líquida?" },
      {
        type: "p",
        text: "A Margem Líquida expressa o percentual do lucro líquido em relação à receita líquida total. Ela considera todos os custos e despesas — operacionais, financeiros, tributários e extraordinários — e mostra o que sobra para os acionistas no final.",
      },
      {
        type: "formula",
        label: "Margem Líquida",
        expression: "(Lucro Líquido ÷ Receita Líquida) × 100",
        description:
          "Ex.: Receita de R$ 1 bilhão e lucro de R$ 150 milhões → Margem Líquida de 15%.",
      },
      { type: "h2", text: "Margem líquida por setor" },
      {
        type: "p",
        text: "A margem líquida varia enormemente entre setores. Por isso, sempre compare a margem de uma empresa com a média do seu próprio setor:",
      },
      {
        type: "table",
        headers: ["Setor", "Margem Líquida Típica"],
        rows: [
          ["Varejo alimentar (supermercados)", "1% a 3%"],
          ["Bancos e financeiras", "15% a 30%"],
          ["Software e tecnologia", "10% a 35%"],
          ["Utilities (energia, saneamento)", "10% a 20%"],
          ["Mineração e commodities", "5% a 25% (varia com preços)"],
          ["Saúde e farmácias", "3% a 8%"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "Uma margem de 3% pode ser excelente para um supermercado (onde o volume de vendas é enorme) e péssima para uma software house. Contexto setorial é tudo.",
      },
      { type: "h2", text: "Como analisar a evolução da margem" },
      {
        type: "p",
        text: "Mais do que o nível atual, a tendência da margem líquida ao longo dos anos revela muito sobre a empresa:",
      },
      {
        type: "ul",
        items: [
          "Margem crescente: empresa ganhando poder de precificação, reduzindo custos ou escalando receita.",
          "Margem estável: negócio maduro com vantagem competitiva consolidada.",
          "Margem em queda: pressão competitiva, aumento de custos ou perda de clientes.",
          "Margem volátil: empresa exposta a commodities, câmbio ou ciclos econômicos.",
        ],
      },
      { type: "h2", text: "Margem bruta vs. margem EBITDA vs. margem líquida" },
      {
        type: "p",
        text: "Existem diferentes 'camadas' de margem, e cada uma conta uma parte diferente da história:",
      },
      {
        type: "ul",
        items: [
          "Margem Bruta: receita menos custo dos produtos/serviços vendidos. Mede a eficiência da produção.",
          "Margem EBITDA: exclui depreciação, amortização, juros e impostos. Mede eficiência operacional.",
          "Margem EBIT (Operacional): inclui D&A, mas exclui resultado financeiro e imposto.",
          "Margem Líquida: o resultado final após todos os custos, despesas e impostos.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Se a margem bruta é boa, mas a margem líquida é ruim, o problema provavelmente está nas despesas administrativas, financeiras (dívida cara) ou na carga tributária — e não na operação principal do negócio.",
      },
    ],
  },
  // ── Novos posts ──────────────────────────────────────────────────────────

  {
    slug: "o-que-e-ev-ebitda",
    title: "O que é EV/EBITDA? Como Usar no Valuation de Empresas",
    description:
      "Entenda o múltiplo EV/EBITDA, como calculá-lo e por que ele é preferido ao P/L para comparar empresas com estruturas de capital diferentes.",
    category: "Valuation",
    readTime: 6,
    publishedAt: "2024-03-05",
    keywords: ["EV/EBITDA", "enterprise value", "valuation", "múltiplos", "análise de ações"],
    content: [
      {
        type: "intro",
        text: "O EV/EBITDA é um dos múltiplos de valuation mais usados por analistas profissionais. Diferente do P/L, ele compara o valor total da empresa — incluindo dívidas — com a geração de caixa operacional, permitindo comparações mais justas entre companhias com estruturas de capital muito diferentes.",
      },
      { type: "h2", text: "O que é EV (Enterprise Value)?" },
      {
        type: "p",
        text: "Enterprise Value, ou Valor da Firma, é o custo teórico de comprar uma empresa inteira: você paga pela capitalização de mercado (preço × número de ações), mas também herda as dívidas e desconta o caixa que a empresa já tem.",
      },
      {
        type: "formula",
        label: "Enterprise Value",
        expression: "EV = Valor de Mercado + Dívida Líquida",
        description: "Dívida Líquida = Dívida Bruta − Caixa e Equivalentes",
      },
      { type: "h2", text: "O que é EV/EBITDA?" },
      {
        type: "p",
        text: "EV/EBITDA indica quantos anos de geração de caixa operacional seriam necessários para pagar o valor total da empresa. Quanto menor, mais barata (em tese) a ação está em relação à sua operação.",
      },
      {
        type: "formula",
        label: "EV/EBITDA",
        expression: "EV/EBITDA = Enterprise Value ÷ EBITDA",
      },
      { type: "h2", text: "Por que usar EV/EBITDA em vez de P/L?" },
      {
        type: "table",
        headers: ["Critério", "P/L", "EV/EBITDA"],
        rows: [
          ["Considera dívida?", "Não", "Sim (via EV)"],
          ["Afetado por impostos?", "Sim", "Não"],
          ["Afetado por amortizações?", "Sim", "Não"],
          ["Bom para comparar setores?", "Limitado", "Mais amplo"],
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Use EV/EBITDA para comparar empresas do mesmo setor. Um EV/EBITDA abaixo da média histórica da empresa ou do setor pode indicar subavaliação — mas sempre verifique o contexto.",
      },
      { type: "h2", text: "Limitações do EV/EBITDA" },
      {
        type: "ul",
        items: [
          "Ignora investimentos em capex necessários para manter a operação (EBITDA não é igual a caixa livre).",
          "Não funciona bem para empresas com prejuízo ou EBITDA negativo.",
          "Setores intensivos em ativos (utilities, telecom) naturalmente têm EV/EBITDA mais alto.",
        ],
      },
    ],
  },

  {
    slug: "o-que-e-roic",
    title: "O que é ROIC? O Indicador que Revela se a Empresa Cria Valor",
    description:
      "Saiba o que é ROIC (Retorno sobre o Capital Investido), como calculá-lo e por que ele é considerado o indicador mais completo de eficiência de uma empresa.",
    category: "Rentabilidade",
    readTime: 7,
    publishedAt: "2024-03-20",
    keywords: ["ROIC", "retorno sobre capital investido", "rentabilidade", "análise fundamentalista", "criação de valor"],
    content: [
      {
        type: "intro",
        text: "O ROIC (Return on Invested Capital) mede quanto dinheiro uma empresa gera para cada real investido no negócio — tanto por acionistas quanto por credores. É considerado por muitos analistas o indicador mais completo de qualidade operacional de uma empresa.",
      },
      { type: "h2", text: "Como calcular o ROIC?" },
      {
        type: "formula",
        label: "ROIC",
        expression: "ROIC = NOPAT ÷ Capital Investido",
        description: "NOPAT = Lucro Operacional × (1 − Alíquota de IR). Capital Investido = Patrimônio Líquido + Dívida Líquida.",
      },
      { type: "h2", text: "O que é um ROIC bom?" },
      {
        type: "p",
        text: "A régua mais usada é comparar o ROIC ao custo de capital (WACC). Se ROIC > WACC, a empresa está criando valor para os acionistas. Se ROIC < WACC, ela está destruindo valor — mesmo com lucro contábil positivo.",
      },
      {
        type: "table",
        headers: ["ROIC vs WACC", "Significado"],
        rows: [
          ["ROIC > WACC", "Empresa cria valor — cada real investido rende mais do que custa"],
          ["ROIC = WACC", "Empresa mantém valor, mas não cria riqueza extra"],
          ["ROIC < WACC", "Empresa destrói valor — melhor distribuir dividendos"],
        ],
      },
      { type: "h2", text: "ROIC vs ROE: qual a diferença?" },
      {
        type: "p",
        text: "O ROE mede o retorno apenas sobre o capital dos acionistas, ignorando a dívida. O ROIC é mais completo porque considera todo o capital investido no negócio — ações e dívidas. Uma empresa pode ter ROE alto simplesmente por usar muita alavancagem, enquanto o ROIC entrega a visão limpa da eficiência operacional.",
      },
      {
        type: "callout",
        variant: "info",
        text: "Empresas como WEG, TOTVS e Localiza historicamente mantêm ROIC consistentemente acima de 15%, o que reflete vantagens competitivas duráveis.",
      },
    ],
  },

  {
    slug: "o-que-e-payout",
    title: "O que é Payout? Como Saber se uma Empresa Distribui Bem seus Lucros",
    description:
      "Entenda o que é payout, como calcular a taxa de distribuição de lucros e o que ela revela sobre a política de dividendos e a saúde financeira de uma empresa.",
    category: "Proventos",
    readTime: 5,
    publishedAt: "2024-04-02",
    keywords: ["payout", "dividendos", "taxa de distribuição", "proventos", "análise de ações"],
    content: [
      {
        type: "intro",
        text: "O payout é a porcentagem do lucro líquido que uma empresa distribui aos acionistas na forma de dividendos ou juros sobre capital próprio. Ele revela a política de dividendos da empresa e ajuda a entender se a distribuição é sustentável.",
      },
      { type: "h2", text: "Como calcular o Payout?" },
      {
        type: "formula",
        label: "Payout Ratio",
        expression: "Payout = (Dividendos Pagos ÷ Lucro Líquido) × 100",
        description: "Resultado em porcentagem. Um payout de 50% significa que metade do lucro foi distribuída.",
      },
      { type: "h2", text: "Payout alto é sempre bom?" },
      {
        type: "p",
        text: "Depende do estágio da empresa. Empresas maduras, com geração de caixa estável e poucas oportunidades de reinvestimento, podem pagar payouts de 70–100% sem problema. Já empresas em crescimento que distribuem muito podem estar sacrificando oportunidades de expansão.",
      },
      {
        type: "table",
        headers: ["Payout", "Perfil típico"],
        rows: [
          ["< 30%", "Empresa em crescimento, reinveste a maior parte do lucro"],
          ["30–60%", "Equilíbrio entre reinvestimento e remuneração ao acionista"],
          ["60–100%", "Empresa madura, foco em dividendos"],
          ["> 100%", "Atenção: distribui mais do que lucra — insustentável no longo prazo"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Payout acima de 100% é um sinal de alerta. A empresa pode estar se endividando para pagar dividendos ou distribuindo reservas — o que não é sustentável.",
      },
      { type: "h2", text: "Payout e Dividend Yield: como se relacionam?" },
      {
        type: "p",
        text: "O Dividend Yield mede o retorno em dividendos em relação ao preço da ação. O Payout mede a fatia do lucro distribuída. Uma empresa pode ter DY alto porque o preço caiu muito (não porque distribui mais) — por isso é essencial analisar os dois juntos.",
      },
    ],
  },

  {
    slug: "como-ler-balanco-patrimonial",
    title: "Como Ler o Balanço Patrimonial de uma Empresa",
    description:
      "Aprenda a interpretar o balanço patrimonial: ativo, passivo e patrimônio líquido — e o que cada linha revela sobre a saúde financeira de uma empresa.",
    category: "Fundamentos",
    readTime: 8,
    publishedAt: "2024-04-15",
    keywords: ["balanço patrimonial", "ativo", "passivo", "patrimônio líquido", "análise fundamentalista", "demonstrações financeiras"],
    content: [
      {
        type: "intro",
        text: "O balanço patrimonial é um dos três documentos financeiros mais importantes de uma empresa — ao lado do DRE e do fluxo de caixa. Ele mostra, em uma data específica, tudo o que a empresa possui (ativos), tudo o que deve (passivos) e o que sobra para os acionistas (patrimônio líquido).",
      },
      { type: "h2", text: "A equação fundamental do balanço" },
      {
        type: "formula",
        label: "Equação Contábil",
        expression: "Ativo = Passivo + Patrimônio Líquido",
        description: "O balanço sempre está em equilíbrio — os recursos da empresa (ativo) são sempre financiados por dívidas (passivo) ou pelo capital dos sócios (PL).",
      },
      { type: "h2", text: "O que é o Ativo?" },
      {
        type: "p",
        text: "O ativo representa todos os recursos controlados pela empresa. É dividido em dois grandes grupos:",
      },
      {
        type: "ul",
        items: [
          "Ativo Circulante: recursos que serão convertidos em dinheiro em até 12 meses (caixa, estoques, contas a receber).",
          "Ativo Não Circulante: recursos de longo prazo (imóveis, máquinas, marcas, participações em outras empresas).",
        ],
      },
      { type: "h2", text: "O que é o Passivo?" },
      {
        type: "ul",
        items: [
          "Passivo Circulante: obrigações com vencimento em até 12 meses (fornecedores, salários, impostos, dívidas de curto prazo).",
          "Passivo Não Circulante: dívidas de longo prazo (debêntures, empréstimos bancários com prazo superior a 1 ano).",
        ],
      },
      { type: "h2", text: "O que é o Patrimônio Líquido?" },
      {
        type: "p",
        text: "É a diferença entre o que a empresa possui e o que deve. Representa o capital investido pelos sócios mais os lucros acumulados ao longo do tempo. Um PL crescente é sinal de que a empresa está gerando e retendo valor.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "Compare o Passivo Circulante com o Ativo Circulante. Se o circulante do ativo for maior, a empresa tem liquidez corrente acima de 1 — o que indica capacidade de pagar suas dívidas de curto prazo.",
      },
      { type: "h2", text: "O que analisar no balanço?" },
      {
        type: "table",
        headers: ["O que verificar", "Por que importa"],
        rows: [
          ["Crescimento do PL", "Empresa acumula valor ao longo do tempo?"],
          ["Relação dívida/PL", "Quão alavancada é a empresa?"],
          ["Liquidez corrente (AC/PC)", "Consegue pagar obrigações de curto prazo?"],
          ["Caixa e equivalentes", "Reservas para crises e oportunidades"],
        ],
      },
    ],
  },

  {
    slug: "o-que-e-free-cash-flow",
    title: "O que é Free Cash Flow (FCF)? O Caixa Que Realmente Importa",
    description:
      "Descubra o que é o Free Cash Flow, como calcular o fluxo de caixa livre e por que ele é considerado o indicador mais honesto da saúde financeira de uma empresa.",
    category: "Resultados",
    readTime: 6,
    publishedAt: "2024-05-01",
    keywords: ["free cash flow", "fluxo de caixa livre", "FCF", "análise fundamentalista", "caixa operacional"],
    content: [
      {
        type: "intro",
        text: "O Free Cash Flow (FCF), ou fluxo de caixa livre, representa o caixa que sobra depois que a empresa pagou todas as suas despesas operacionais e investiu em manter e expandir seus ativos. É o dinheiro de verdade — pronto para ser distribuído aos acionistas, pagar dívidas ou fazer aquisições.",
      },
      { type: "h2", text: "Como calcular o Free Cash Flow?" },
      {
        type: "formula",
        label: "Free Cash Flow",
        expression: "FCF = Fluxo de Caixa Operacional − Capex",
        description: "Capex (Capital Expenditure) são os investimentos em ativos fixos: máquinas, imóveis, tecnologia.",
      },
      { type: "h2", text: "Por que o FCF é mais confiável que o lucro líquido?" },
      {
        type: "p",
        text: "O lucro contábil pode ser distorcido por escolhas de depreciação, amortização e reconhecimento de receitas. O caixa não mente: ou o dinheiro entrou na conta ou não entrou. Uma empresa pode apresentar lucro e ainda assim queimar caixa — o que é insustentável.",
      },
      {
        type: "callout",
        variant: "warning",
        text: "Desconfie de empresas que mostram lucro crescente mas FCF estagnado ou negativo por vários trimestres. Pode ser sinal de problemas no ciclo de caixa ou capitalização agressiva de despesas.",
      },
      { type: "h2", text: "FCF positivo vs. FCF negativo" },
      {
        type: "table",
        headers: ["Situação", "O que pode indicar"],
        rows: [
          ["FCF positivo consistente", "Negócio sólido, capaz de se autofinanciar"],
          ["FCF negativo em crescimento", "Empresa investe pesado — pode ser normal em expansão"],
          ["FCF negativo em empresa madura", "Sinal de alerta: operação consome mais do que gera"],
        ],
      },
      { type: "h2", text: "Como usar o FCF na análise?" },
      {
        type: "ul",
        items: [
          "FCF Yield: FCF ÷ Valor de Mercado. Quanto maior, mais caixa a empresa gera em relação ao preço pago.",
          "Compare o FCF com o lucro líquido ao longo de vários anos — convergência é sinal de qualidade.",
          "Empresas com FCF crescente têm mais margem para pagar dividendos, recomprar ações e investir sem se endividar.",
        ],
      },
    ],
  },

  {
    slug: "divida-bruta-vs-divida-liquida",
    title: "Dívida Bruta vs Dívida Líquida: Qual Usar na Análise?",
    description:
      "Entenda a diferença entre dívida bruta e dívida líquida, como calcular cada uma e qual delas usar para avaliar o real nível de endividamento de uma empresa.",
    category: "Endividamento",
    readTime: 5,
    publishedAt: "2024-05-15",
    keywords: ["dívida líquida", "dívida bruta", "endividamento", "análise fundamentalista", "alavancagem"],
    content: [
      {
        type: "intro",
        text: "Ao analisar o endividamento de uma empresa, dois conceitos aparecem com frequência: dívida bruta e dívida líquida. Saber a diferença entre eles é fundamental para avaliar o real risco financeiro de uma companhia.",
      },
      { type: "h2", text: "O que é Dívida Bruta?" },
      {
        type: "p",
        text: "Dívida bruta é o total de obrigações financeiras da empresa — empréstimos bancários, debêntures, financiamentos — sem descontar nenhum ativo. É o valor total que a empresa deve a terceiros.",
      },
      { type: "h2", text: "O que é Dívida Líquida?" },
      {
        type: "formula",
        label: "Dívida Líquida",
        expression: "Dívida Líquida = Dívida Bruta − Caixa e Equivalentes",
        description: "Caixa e equivalentes incluem aplicações financeiras de alta liquidez.",
      },
      {
        type: "p",
        text: "A lógica é simples: se a empresa tem R$ 1 bilhão em dívidas mas também tem R$ 600 milhões em caixa, ela poderia quitar 60% da dívida imediatamente. Sua dívida líquida seria de apenas R$ 400 milhões.",
      },
      { type: "h2", text: "Qual usar na análise?" },
      {
        type: "p",
        text: "Na maioria dos casos, a dívida líquida é mais relevante — ela reflete o endividamento real após considerar a liquidez disponível. A dívida bruta é útil quando se quer avaliar o risco de refinanciamento ou quando o caixa da empresa tem restrições de uso.",
      },
      {
        type: "table",
        headers: ["Indicador", "Quando usar"],
        rows: [
          ["Dívida Líquida", "Análise do endividamento real; cálculo do EV"],
          ["Dívida Bruta", "Análise de risco de crédito; estrutura de vencimentos"],
          ["Dívida Líq./EBITDA", "Comparar alavancagem entre empresas do setor"],
          ["Dívida Bruta/PL", "Medir nível de alavancagem financeira"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "Empresas com caixa maior que a dívida bruta têm 'caixa líquido' — situação muito confortável que pode indicar oportunidade de dividendos extraordinários ou aquisições.",
      },
    ],
  },

  {
    slug: "o-que-e-margem-bruta",
    title: "O que é Margem Bruta? Como Analisar a Eficiência do Negócio",
    description:
      "Entenda o que é margem bruta, como calculá-la e o que ela revela sobre a capacidade de uma empresa de gerar lucro antes das despesas operacionais.",
    category: "Resultados",
    readTime: 5,
    publishedAt: "2024-06-01",
    keywords: ["margem bruta", "lucratividade", "análise fundamentalista", "DRE", "custos"],
    content: [
      {
        type: "intro",
        text: "A margem bruta é o primeiro grande indicador de lucratividade no DRE. Ela mostra quanto sobra da receita depois de descontados os custos diretos de produção ou prestação de serviço — antes mesmo das despesas operacionais, financeiras e impostos.",
      },
      { type: "h2", text: "Como calcular a Margem Bruta?" },
      {
        type: "formula",
        label: "Margem Bruta",
        expression: "Margem Bruta = (Lucro Bruto ÷ Receita Líquida) × 100",
        description: "Lucro Bruto = Receita Líquida − Custo dos Produtos/Serviços Vendidos (CPV/CSV)",
      },
      { type: "h2", text: "O que a Margem Bruta revela?" },
      {
        type: "p",
        text: "A margem bruta mede o poder de precificação e a eficiência produtiva de uma empresa. Empresas com vantagens competitivas — marcas fortes, tecnologia proprietária, economias de escala — costumam manter margens brutas altas e estáveis ao longo do tempo.",
      },
      {
        type: "table",
        headers: ["Setor", "Margem Bruta típica"],
        rows: [
          ["Software / SaaS", "60–80%"],
          ["Varejo alimentar", "20–30%"],
          ["Indústria pesada", "15–25%"],
          ["Serviços financeiros", "40–70%"],
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Compare a margem bruta da empresa com a de seus concorrentes no mesmo setor. Uma margem consistentemente superior indica alguma vantagem competitiva — seja em custos, precificação ou mix de produtos.",
      },
      { type: "h2", text: "Margem Bruta vs Margem Líquida" },
      {
        type: "p",
        text: "Uma empresa pode ter margem bruta excelente e margem líquida fraca se tiver despesas operacionais excessivas, dívida cara ou carga tributária elevada. Analisar as duas juntas ajuda a identificar onde está o problema: na operação principal ou nas despesas abaixo do lucro bruto.",
      },
    ],
  },
  // ─── Análises de Ações ───────────────────────────────────────────────────
  {
    slug: "analise-wege3-vale-a-pena-comprar",
    title: "Análise WEGE3: Vale a Pena Comprar em 2025?",
    description:
      "Análise completa de WEGE3: indicadores fundamentalistas, resultados recentes, valuation e perspectivas. Descubra se WEG vale a pena comprar em 2025.",
    category: "Análises",
    readTime: 10,
    publishedAt: "2025-07-15",
    keywords: [
      "WEGE3",
      "análise WEGE3",
      "WEG análise fundamentalista",
      "comprar ou vender WEGE3",
      "dividendos WEGE3",
      "valuation WEGE3",
      "ações brasileiras",
      "análise de ações B3",
    ],
    content: [
      {
        type: "intro",
        text: "WEGE3 é uma das ações mais acompanhadas da B3 — e por boas razões. A WEG S.A. é considerada por muitos analistas um dos melhores ativos da bolsa brasileira: empresa industrial com expansão global, margens crescentes e histórico impecável de geração de caixa. Mas após anos de valorização expressiva, o papel negocia a múltiplos exigentes. Neste artigo você vai encontrar uma análise fundamentalista completa de WEGE3 para ajudar a decidir se vale a pena comprar, manter ou esperar uma melhor entrada em 2025.",
      },
      { type: "h2", text: "Visão geral da WEG S.A." },
      {
        type: "p",
        text: "Fundada em 1961 em Jaraguá do Sul (SC), a WEG é uma multinacional brasileira do setor industrial-elétrico. Seu portfólio abrange motores elétricos, transformadores, geradores, automação industrial, tintas industriais e soluções de energia renovável — com destaque crescente para geração solar e eólica.",
      },
      {
        type: "p",
        text: "A empresa opera em mais de 40 países, com plantas industriais na Europa, América do Norte, Ásia e África. Em 2024, aproximadamente 60% da receita líquida já provinha do mercado externo, evidenciando a transformação de uma fabricante regional em uma companhia verdadeiramente global.",
      },
      {
        type: "p",
        text: "Sua posição competitiva é reforçada por três pilares: eficiência de manufatura (integração vertical muito acima da média do setor), capacidade de inovação (R&D contínuo em eficiência energética) e uma cultura de gestão sólida, mantida desde a fundação por uma liderança focada em resultados de longo prazo.",
      },
      { type: "h2", text: "Análise fundamentalista de WEGE3" },
      {
        type: "p",
        text: "A tabela abaixo reúne os principais indicadores fundamentalistas de WEGE3 com base nos resultados dos últimos 12 meses encerrados em março de 2025. Os dados são referência para fins educacionais — atualize sempre com as fontes oficiais antes de tomar qualquer decisão.",
      },
      {
        type: "table",
        headers: ["Indicador", "WEGE3", "Referência do setor"],
        rows: [
          ["P/L (Preço/Lucro)", "~38x", "Industrial global: 20–30x"],
          ["P/VPA (Preço/Valor Patrimonial)", "~11x", "Industrial global: 3–6x"],
          ["ROE (Retorno s/ Patrimônio)", "~29%", "Benchmark: acima de 15%"],
          ["Dívida Líquida / EBITDA", "Caixa líquido (~−0,3x)", "Saudável: abaixo de 2x"],
          ["Dividend Yield", "~1,8%", "Média B3: ~6%"],
          ["Margem EBITDA", "~22%", "Industrial diversificado: 10–18%"],
          ["CAGR Receita (5 anos)", "~18% a.a.", "—"],
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "O P/L de ~38x parece alto em relação ao setor, mas a WEG historicamente negocia com prêmio expressivo justificado pelo crescimento consistente de receita e lucro acima de dois dígitos ao ano. A métrica que importa aqui não é o P/L absoluto, mas o PEG (P/L ÷ crescimento).",
      },
      { type: "h3", text: "P/L e Valuation relativo" },
      {
        type: "p",
        text: "Com um lucro crescendo em média 20% ao ano nos últimos cinco anos, o PEG ratio fica em torno de 1,9 — ainda acima de 1, o que indica algum prêmio no preço, mas não necessariamente sobrevalorização excessiva para uma empresa de qualidade comprovada.",
      },
      { type: "h3", text: "ROE e eficiência operacional" },
      {
        type: "p",
        text: "Um ROE de ~29% é notável para uma empresa industrial de grande porte. Significa que a WEG gera R$ 0,29 de lucro para cada R$ 1 de patrimônio líquido — muito acima de competidores como ABB e Siemens, que ficam entre 15% e 22%.",
      },
      { type: "h3", text: "Dívida e solidez financeira" },
      {
        type: "p",
        text: "A WEG opera com caixa líquido positivo — ou seja, tem mais dinheiro em caixa do que dívidas. Isso garante flexibilidade para aquisições estratégicas (como a recente expansão na América do Norte) e reduz o risco em cenários de alta de juros.",
      },
      { type: "h2", text: "Análise dos resultados recentes" },
      {
        type: "p",
        text: "No 4T24, a WEG reportou receita líquida de R$ 9,4 bilhões (+17% A/A), EBITDA de R$ 2,0 bilhões (+19% A/A) e lucro líquido de R$ 1,5 bilhão (+21% A/A). Os resultados vieram acima do consenso de analistas em todos os três indicadores.",
      },
      {
        type: "p",
        text: "O destaque operacional foi o segmento de Energia & Automação no exterior, que cresceu 28% em receita. A demanda por motores de eficiência energética e soluções para data centers — impulsionada pela expansão da inteligência artificial — representa uma nova frente de crescimento não precificada no modelo de consenso de muitos analistas.",
      },
      {
        type: "callout",
        variant: "info",
        text: "Data centers e IA: a WEG é fornecedora estratégica de motores e sistemas de resfriamento para grandes players de tecnologia. Analistas estimam que esse segmento pode representar até 15% da receita total até 2027.",
      },
      { type: "h2", text: "Pontos positivos e riscos de WEGE3" },
      { type: "h3", text: "Pontos positivos" },
      {
        type: "ul",
        items: [
          "Crescimento consistente de receita e lucro há mais de 10 anos consecutivos",
          "Diversificação geográfica: ~60% da receita fora do Brasil, reduzindo exposição ao ciclo econômico doméstico",
          "Posição financeira sólida com caixa líquido positivo",
          "Exposição ao megatrend de transição energética (solar, eólica, veículos elétricos)",
          "Alta barreira de entrada: integração vertical e marca consolidada globalmente",
          "Gestão de excelência com track record de alocação eficiente de capital",
        ],
      },
      { type: "h3", text: "Riscos e pontos de atenção" },
      {
        type: "ul",
        items: [
          "Valuation exigente: P/L de ~38x deixa pouca margem para qualquer decepção nos resultados",
          "Câmbio: valorização do real impacta negativamente a conversão de receitas externas",
          "Concorrência global: ABB, Siemens e WEG disputam os mesmos contratos de grande porte",
          "Concentração no mercado brasileiro pode ser afetada por queda na atividade industrial",
          "Risco de execução em aquisições internacionais — integração de empresas compradas fora do Brasil",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "O principal risco de curto prazo para WEGE3 não é operacional, mas de expectativas. A ação precifica crescimento acelerado — qualquer resultado abaixo do esperado, mesmo positivo em termos absolutos, pode provocar correção expressiva no preço.",
      },
      { type: "h2", text: "Valuation: qual o preço justo de WEGE3?" },
      {
        type: "p",
        text: "Estimamos o preço justo de WEGE3 com base em dois métodos: múltiplo-alvo e fluxo de caixa descontado (DCF) simplificado.",
      },
      {
        type: "formula",
        label: "Método 1 — P/L-alvo",
        expression: "Preço Justo = LPA estimado 2025 × P/L-alvo",
        description: "Assumindo LPA de R$ 1,35 e P/L-alvo de 32x (desconto de 15% ao múltiplo atual): Preço Justo ≈ R$ 43,20",
      },
      {
        type: "formula",
        label: "Método 2 — DCF simplificado",
        expression: "Preço Justo = FCL × (1 + g)^n ÷ (WACC − g)",
        description: "Crescimento de FCL de 16% a.a. por 5 anos, g terminal de 5%, WACC de 11%: Preço Justo no intervalo de R$ 40–46",
      },
      {
        type: "table",
        headers: ["Cenário", "Preço Justo estimado", "Upside/Downside (vs R$ 47)"],
        rows: [
          ["Pessimista (P/L 28x, crescimento 12%)", "R$ 37,80", "−19,6%"],
          ["Base (P/L 32x, crescimento 16%)", "R$ 43,20", "−8,1%"],
          ["Otimista (P/L 36x, crescimento 20%)", "R$ 48,60", "+3,4%"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Atenção: os preços acima são estimativas educacionais baseadas em projeções. Não constituem recomendação de investimento. Consulte um assessor de investimentos habilitado antes de tomar qualquer decisão.",
      },
      { type: "h2", text: "Conclusão: vale a pena comprar WEGE3 em 2025?" },
      {
        type: "p",
        text: "WEGE3 é, sem dúvida, uma das empresas de maior qualidade listadas na B3. Seu histórico de crescimento, solidez financeira e exposição global a tendências estruturais (transição energética, automação, IA) fazem dela um ativo que merece espaço em carteiras de longo prazo.",
      },
      {
        type: "p",
        text: "O desafio é o preço. Com múltiplos acima da média histórica e do setor, o investidor que comprar WEGE3 no patamar atual depende da manutenção de um crescimento robusto para justificar o valuation. Qualquer desaceleração — seja macro, cambial ou competitiva — pode resultar em correção significativa.",
      },
      {
        type: "p",
        text: "Nossa leitura: WEGE3 é um ativo para posição no portfólio de longo prazo, mas o ponto de entrada importa. Investidores mais conservadores podem aguardar correções para melhorar o custo médio. Quem já tem posição e acredita no crescimento estrutural da empresa pode manter sem pressa de realizar.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "Leia também: \"O que é P/L?\" e \"O que é ROE?\" — dois indicadores essenciais para entender o valuation da WEG e de qualquer outra empresa listada na bolsa.",
      },
    ],
  },
  {
    slug: "analise-itub4-vale-a-pena-comprar",
    title: "Análise ITUB4: Vale a Pena Comprar o Itaú em 2025?",
    description:
      "Análise fundamentalista completa de ITUB4: ROE, dividendos, resultados recentes e preço justo. Itaú Unibanco vale a pena em 2025? Veja nossa análise.",
    category: "Análises",
    readTime: 9,
    publishedAt: "2025-07-22",
    keywords: [
      "ITUB4",
      "análise ITUB4",
      "Itaú Unibanco análise fundamentalista",
      "comprar ou vender ITUB4",
      "dividendos ITUB4",
      "valuation ITUB4",
      "ações de bancos B3",
      "análise de ações brasileiras",
    ],
    content: [
      {
        type: "intro",
        text: "ITUB4 é a ação mais negociada da B3 em volume financeiro e uma das maiores posições em carteiras de investidores pessoa física do Brasil. O Itaú Unibanco é o maior banco privado da América Latina, com ROE consistentemente acima de 20% e uma política de dividendos que atrai tanto quem busca renda quanto quem busca crescimento. Mas após resultados sólidos em 2024, o papel entrou em radar de analistas divididos. Veja nossa análise completa de ITUB4 para 2025.",
      },
      { type: "h2", text: "Visão geral do Itaú Unibanco" },
      {
        type: "p",
        text: "O Itaú Unibanco Holding (ITUB4) é o maior banco privado da América Latina por ativos totais, com presença em 18 países e uma base de mais de 60 milhões de clientes ativos. O modelo de negócio é diversificado: crédito a pessoas físicas e empresas, cartões, seguros, gestão de fortunas, câmbio e serviços de investimento.",
      },
      {
        type: "p",
        text: "O diferencial competitivo do Itaú reside em sua escala (que dilui custos fixos), na tecnologia (investimentos anuais de R$ 3+ bilhões em digital) e em um histórico de gestão de risco acima da média do setor bancário brasileiro — evidenciado por índices de inadimplência consistentemente menores que os concorrentes.",
      },
      { type: "h2", text: "Análise fundamentalista de ITUB4" },
      {
        type: "table",
        headers: ["Indicador", "ITUB4", "Benchmark bancário"],
        rows: [
          ["P/L (Preço/Lucro)", "~9x", "Bancos globais grandes: 10–14x"],
          ["P/VPA (Preço/VP)", "~2,0x", "Bancos brasileiros: 1,5–2,5x"],
          ["ROE", "~23%", "Benchmark: acima de 15%"],
          ["Dividend Yield", "~5,5%", "Média B3: ~6%"],
          ["Índice de Basileia", "~14,5%", "Mínimo regulatório: 10,5%"],
          ["Inadimplência (NPL +90d)", "~2,9%", "Média setor: ~3,5%"],
          ["Margem Financeira Líquida (NIM)", "~8,2%", "—"],
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Bancos são avaliados de forma diferente de empresas industriais. Os indicadores mais relevantes são: ROE (eficiência no uso do capital), P/VPA (prêmio sobre o valor patrimonial), Dividend Yield e inadimplência (qualidade da carteira de crédito).",
      },
      { type: "h3", text: "ROE: o principal diferencial do Itaú" },
      {
        type: "p",
        text: "Um ROE de ~23% no setor bancário brasileiro é excelente. Para contexto: Bradesco e Santander Brasil operam com ROE entre 13% e 16%. O Banco do Brasil chega próximo de 21%, mas carrega riscos adicionais por ser estatal. O Itaú é consistentemente o banco de maior rentabilidade entre os privados.",
      },
      { type: "h3", text: "Dividendos: renda sem abrir mão da qualidade" },
      {
        type: "p",
        text: "ITUB4 distribui dividendos trimestralmente, com payout de aproximadamente 50–60% do lucro. Com dividend yield em torno de 5,5% e crescimento do lucro na faixa de 10–12% ao ano, o papel oferece uma combinação atrativa de renda e apreciação de capital.",
      },
      { type: "h2", text: "Análise dos resultados recentes" },
      {
        type: "p",
        text: "No 4T24, o Itaú reportou lucro recorrente de R$ 10,7 bilhões (+15% A/A) e ROE recorrente de 22,5%. A carteira de crédito total atingiu R$ 1,27 trilhão (+11% A/A), com crescimento equilibrado entre pessoa física e empresas. A inadimplência acima de 90 dias ficou em 2,9% — estável na comparação anual e abaixo dos principais concorrentes.",
      },
      {
        type: "p",
        text: "O guidance para 2025 indica crescimento da carteira de crédito entre 6,5% e 9,5% e margem financeira crescendo entre 4% e 7%. A expansão da receita de serviços — especialmente seguros e gestão de patrimônio — segue sendo um driver de qualidade que diversifica o resultado além do spread bancário tradicional.",
      },
      { type: "h2", text: "Pontos positivos e riscos de ITUB4" },
      { type: "h3", text: "Pontos positivos" },
      {
        type: "ul",
        items: [
          "ROE consistentemente acima de 20% — o mais alto entre bancos privados brasileiros",
          "Distribuição regular de dividendos trimestrais com yield atrativo",
          "Liderança em tecnologia bancária no Brasil: app mais bem avaliado do setor",
          "Diversificação de receitas entre crédito, serviços, seguros e gestão de ativos",
          "Gestão conservadora de risco: inadimplência abaixo da média do setor",
          "Valuation atrativo em base absoluta (P/L ~9x) vs. qualidade entregue",
        ],
      },
      { type: "h3", text: "Riscos e pontos de atenção" },
      {
        type: "ul",
        items: [
          "Ambiente de juros altos comprime a demanda por crédito e aumenta a inadimplência futura",
          "Desaceleração econômica pode pressionar a carteira de pessoa física e PMEs",
          "Risco regulatório: mudanças em regras de spread, tarifas ou requerimentos de capital",
          "Concorrência crescente de fintechs (Nubank, Inter) em segmentos de maior margem",
          "Exposição ao risco político via regulação bancária e ambiente macroeconômico brasileiro",
        ],
      },
      { type: "h2", text: "Valuation: qual o preço justo de ITUB4?" },
      {
        type: "formula",
        label: "Método — P/VPA-alvo ajustado ao ROE",
        expression: "P/VPA justo = ROE ÷ Custo de Capital (Ke)",
        description: "Com ROE de 23% e Ke de ~14% (taxa livre de risco + prêmio de risco Brasil): P/VPA justo ≈ 1,64x. Com VPA de ~R$ 16, preço justo ≈ R$ 26. Prêmio adicional pela qualidade: intervalo base R$ 26–30.",
      },
      {
        type: "table",
        headers: ["Cenário", "Preço Justo estimado", "Upside/Downside (vs R$ 27)"],
        rows: [
          ["Pessimista (ROE 19%, Ke 15%)", "R$ 20,30", "−24,8%"],
          ["Base (ROE 23%, Ke 14%)", "R$ 26,30", "−2,6%"],
          ["Otimista (ROE 25%, Ke 13%)", "R$ 30,80", "+14,1%"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Os preços estimados acima são para fins educacionais. Não constituem recomendação de compra ou venda. Sempre consulte um profissional habilitado e atualize os dados com as fontes oficiais antes de investir.",
      },
      { type: "h2", text: "Conclusão: vale a pena comprar ITUB4 em 2025?" },
      {
        type: "p",
        text: "ITUB4 negocia próximo do valor justo pelo modelo de P/VPA ajustado ao ROE — o que significa que o mercado já precifica boa parte da qualidade do banco. O upside imediato é limitado, mas o papel oferece algo que poucos ativos de qualidade da B3 têm: dividend yield próximo de 6% com crescimento de lucro de dois dígitos.",
      },
      {
        type: "p",
        text: "Para o investidor de longo prazo que busca combinar renda com crescimento, ITUB4 permanece um dos ativos mais sólidos da B3. Em cenários de estresse — quedas pontuais por ruído macroeconômico ou político — o papel historicamente se recupera rapidamente e oferece oportunidades de entrada.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "Leia também: \"O que é ROE?\" e \"O que é Dividend Yield?\" — dois indicadores essenciais para avaliar bancos e empresas pagadoras de proventos.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, count = 3): BlogPost[] {
  const post = getPostBySlug(slug);
  if (!post) return BLOG_POSTS.slice(0, count);
  return BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, count);
}
