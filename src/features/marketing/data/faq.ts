export interface FaqQuestion {
  q: string;
  a: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  questions: FaqQuestion[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "sobre",
    title: "Sobre a Analiso",
    questions: [
      {
        q: "O que é a Analiso?",
        a: "A Analiso é uma plataforma de análise de empresas brasileiras listadas na B3. Ela transforma demonstrações financeiras e indicadores em uma leitura estruturada, dividida em 5 pilares — Lucratividade, Endividamento, Eficiência, Crescimento e Valuation — com contexto histórico e pontos de atenção identificados automaticamente.",
      },
      {
        q: "Para quem é a Analiso?",
        a: "Para qualquer pessoa que quer entender melhor as empresas que investe ou pretende investir — sem precisar ser analista. Funciona tanto para quem está começando quanto para quem já tem experiência mas quer mais clareza e menos ruído no acompanhamento.",
      },
      {
        q: "O que diferencia a Analiso de outras plataformas?",
        a: "A maioria das plataformas mostra dados brutos — tabelas, gráficos e indicadores sem interpretação. A Analiso prioriza leitura guiada: cada pilar tem uma lógica clara, cada número vem com contexto histórico, e os pontos de atenção são sinalizados antes de você precisar procurar. Menos ruído, mais clareza.",
      },
      {
        q: "A Analiso dá recomendações de compra ou venda?",
        a: "Não. A Analiso não recomenda comprar ou vender nenhum ativo. Ela fornece análise estruturada para que você tome suas próprias decisões com mais clareza e contexto. Toda interpretação parte dos dados reais, sem viés especulativo.",
      },
    ],
  },
  {
    id: "como-funciona",
    title: "Como funciona na prática",
    questions: [
      {
        q: "O que são os 5 pilares de análise?",
        a: "Os 5 pilares são as dimensões que a Analiso usa para organizar a saúde de cada empresa: Lucratividade, Endividamento, Eficiência, Crescimento e Valuation. Cada pilar reúne os indicadores mais relevantes daquela dimensão, com histórico e pontos de atenção — em vez de exibir todos os indicadores de uma vez sem contexto.",
      },
      {
        q: "O que é o Resumo em 60s?",
        a: "É um resumo gerado automaticamente com o principal ponto forte e o principal ponto de atenção de cada empresa, baseado nos indicadores do período mais recente. O objetivo é dar uma leitura rápida e objetiva antes de você ir mais fundo em qualquer pilar.",
      },
      {
        q: "Como funcionam os alertas?",
        a: "Você pode configurar alertas para as empresas da sua Watchlist. Quando algo relevante acontece — resultados publicados, mudança significativa em um indicador, fato relevante divulgado — a plataforma te notifica. Você define quais tipos de alerta quer receber.",
      },
      {
        q: "Posso comparar empresas?",
        a: "Sim. A ferramenta de comparação permite colocar duas ou mais empresas lado a lado em cada pilar. Em vez de abrir várias abas e tentar lembrar os números, você vê tudo no mesmo lugar, com os mesmos critérios aplicados a cada empresa.",
      },
      {
        q: "O que é o Luiz?",
        a: "O Luiz é o assistente de IA integrado à plataforma. Você pode perguntar sobre qualquer empresa disponível — entender um indicador, comparar com o histórico, pedir um resumo ou tirar uma dúvida conceitual. O Luiz responde com base nos dados reais da Analiso.",
      },
    ],
  },
  {
    id: "dados",
    title: "Dados e fontes",
    questions: [
      {
        q: "De onde vêm os dados da Analiso?",
        a: "Os dados financeiros vêm de fontes oficiais: demonstrações financeiras publicadas pelas próprias empresas na CVM (Comissão de Valores Mobiliários) e documentos regulatórios. Nada de estimativas ou fontes não verificáveis.",
      },
      {
        q: "Com que frequência os dados são atualizados?",
        a: "Os dados são atualizados conforme as empresas publicam seus resultados — trimestral para a maioria das companhias. Quando um novo resultado é disponibilizado, a análise é atualizada automaticamente e você recebe um alerta se tiver a empresa na sua Watchlist.",
      },
      {
        q: "Consigo ver a fonte de cada indicador?",
        a: "Sim. Em cada indicador e ponto de atenção você pode acessar a fonte — o documento oficial da CVM que originou aquele dado. A verificação é parte do design, não um recurso escondido.",
      },
    ],
  },
  {
    id: "conta",
    title: "Conta e acesso",
    questions: [
      {
        q: "A Analiso é gratuita?",
        a: "Existe um plano gratuito que dá acesso a parte da plataforma. Para acesso completo a todas as análises, alertas ilimitados e comparações, existe um plano pago. Você pode começar gratuitamente e entender o produto antes de decidir.",
      },
      {
        q: "Como faço para criar uma conta?",
        a: "Basta clicar em 'Criar conta' e entrar com o Google ou com e-mail. Leva menos de um minuto e não exige cartão de crédito para começar.",
      },
      {
        q: "Posso cancelar quando quiser?",
        a: "Sim. Não há fidelidade ou multa por cancelamento. Se você decidir cancelar, basta acessar as configurações da sua conta — o cancelamento é imediato.",
      },
      {
        q: "A plataforma funciona no celular?",
        a: "Sim. A Analiso é responsiva e funciona bem em smartphones e tablets. Para uma experiência mais completa de análise — especialmente comparações e leitura de pilares — recomendamos usar em uma tela maior.",
      },
    ],
  },
];
