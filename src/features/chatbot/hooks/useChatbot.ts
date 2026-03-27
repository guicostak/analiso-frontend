"use client";

import { useCallback, useState } from "react";
import type { ChatMessage } from "../interfaces";

// ─── Utilitário ───────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Engine de respostas mockadas ─────────────────────────────────────────────

type MockEntry = {
  patterns: RegExp[];
  content: string;
  suggestions?: string[];
};

const MOCK_RESPONSES: MockEntry[] = [
  {
    patterns: [/\bp[/\\]?l\b/i, /preço\s*.*\s*lucro/i],
    content:
      "**P/L — Preço sobre Lucro**\n\nIndica quanto o mercado paga por cada real de lucro da empresa.\n\n**Por que importa:** Um P/L alto pode refletir expectativa de crescimento. Um P/L baixo pode sinalizar empresa barata — ou empresa com problema real.\n\n**Como ler:** Isolado, o número diz pouco. Compare com o histórico da própria empresa e com concorrentes do mesmo setor.",
    suggestions: ["Qual P/L é considerado alto?", "Como P/L se compara ao P/VP?", "O que é EV/EBITDA?"],
  },
  {
    patterns: [/p\s*\/?\s*vp/i, /valor\s*patrimon/i],
    content:
      "**P/VP — Preço sobre Valor Patrimonial**\n\nCompara o preço de mercado com o valor contábil dos ativos da empresa.\n\n**Por que importa:** Mostra se o mercado valoriza a empresa acima ou abaixo do que ela \"vale no papel\". Muito usado em bancos e seguradoras.\n\n**Como ler:** P/VP < 1 pode indicar empresa barata — ou ativos de baixa qualidade. Sempre confirme com outros indicadores.",
    suggestions: ["O que é ROE?", "P/VP < 1 é sempre bom?", "Que indicador complementa o P/VP?"],
  },
  {
    patterns: [/dividend\s*yield/i, /\bdy\b/i, /dividendo/i, /provento/i],
    content:
      "**Dividend Yield — DY**\n\nRendimento de dividendos em relação ao preço atual da ação.\n\n**Por que importa:** Mostra o retorno em proventos do período. Empresas maduras e estáveis tendem a distribuir mais.\n\n**Como ler:** DY alto nem sempre é positivo — pode refletir queda do preço ou distribuição insustentável. Verifique o payout e a consistência histórica.",
    suggestions: ["O que é payout?", "Quais setores pagam mais dividendos?", "DY alto é sempre bom?"],
  },
  {
    patterns: [/\broe\b/i, /retorno.*patrimôn/i],
    content:
      "**ROE — Return on Equity**\n\nMede a eficiência com que a empresa gera lucro usando o capital dos acionistas.\n\n**Por que importa:** ROE consistentemente alto indica vantagem competitiva real — a empresa sabe usar bem o dinheiro que tem.\n\n**Como ler:** ROE alto com dívida elevada pode ser enganoso. Compare com o ROIC para entender se o retorno é genuíno ou alavancado.",
    suggestions: ["O que é ROIC?", "ROE vs ROIC: qual é mais confiável?", "Qual ROE é considerado bom?"],
  },
  {
    patterns: [/\broic\b/i, /retorno.*capital.*invest/i],
    content:
      "**ROIC — Return on Invested Capital**\n\nRetorno gerado sobre todo o capital investido na operação, incluindo dívida.\n\n**Por que importa:** Considerado por muitos analistas como o indicador mais honesto de qualidade. Empresas com ROIC > custo de capital criam valor real.\n\n**Como ler:** ROIC acima de 15% de forma consistente é sinal de negócio de qualidade. Compare com o WACC da empresa para saber se está criando ou destruindo valor.",
    suggestions: ["O que é WACC?", "ROIC vs ROE: qual escolher?", "Como identificar ROIC alto?"],
  },
  {
    patterns: [/\bebitda\b/i, /lucro.*operacional/i],
    content:
      "**EBITDA**\n\nLucro antes de juros, impostos, depreciação e amortização. Proxy do caixa operacional da empresa.\n\n**Por que importa:** Elimina distorções contábeis e financeiras, mostrando a capacidade operacional bruta.\n\n**Como ler:** EBITDA crescendo com margem estável é sinal saudável. EBITDA crescendo com margem caindo merece atenção.",
    suggestions: ["O que é EV/EBITDA?", "Qual margem EBITDA é boa?", "EBITDA vs lucro líquido?"],
  },
  {
    patterns: [/margem.*l[íi]quida/i, /lucro.*l[íi]quido/i],
    content:
      "**Margem Líquida**\n\nPercentual de lucro líquido sobre a receita total.\n\n**Por que importa:** Mostra quanto de cada real vendido fica na empresa após todos os custos, impostos e despesas financeiras.\n\n**Como ler:** Varia muito por setor. Varejistas operam com 2–5%. Empresas de software podem ter 30%+. Compare sempre com o setor e com o histórico próprio.",
    suggestions: ["O que é margem EBITDA?", "Margem líquida vs margem bruta?", "Que setor tem melhor margem?"],
  },
  {
    patterns: [/margem.*ebitda/i, /ebitda.*margem/i],
    content:
      "**Margem EBITDA**\n\nPercentual do EBITDA sobre a receita. Mede a lucratividade operacional antes de custos financeiros e contábeis.\n\n**Por que importa:** Quanto maior, mais eficiente a operação. Acima de 30% é considerado robusto na maioria dos setores.\n\n**Como ler:** Queda na margem EBITDA com receita crescendo pode indicar custos fora de controle.",
    suggestions: ["O que é EBITDA?", "Margem EBITDA vs margem líquida?", "O que causa queda na margem EBITDA?"],
  },
  {
    patterns: [/d[íi]vida.*ebitda/i, /alavancagem/i, /endividamento/i],
    content:
      "**Dívida/EBITDA — Alavancagem**\n\nIndica quantos anos de EBITDA seriam necessários para pagar toda a dívida líquida.\n\n**Por que importa:** Mede o risco financeiro da empresa. Em ambiente de juros altos, empresas muito alavancadas sofrem mais.\n\n**Como ler:** Abaixo de 2× é confortável. Entre 2× e 3× pede contexto. Acima de 4× é alerta elevado.",
    suggestions: ["O que é dívida líquida?", "Como a Selic afeta empresas alavancadas?", "Dívida bruta vs dívida líquida?"],
  },
  {
    patterns: [/ev\s*\/?\s*ebitda/i],
    content:
      "**EV/EBITDA — Enterprise Value sobre EBITDA**\n\nCompara o valor total da empresa (incluindo dívida) com sua geração de caixa operacional.\n\n**Por que importa:** É uma das métricas de valuation mais usadas para comparar empresas de setores diferentes, pois desconta estrutura de capital.\n\n**Como ler:** Abaixo de 8× tende a ser conservador. Acima de 15× implica alta expectativa de crescimento.",
    suggestions: ["O que é EV?", "EV/EBITDA vs P/L: qual usar?", "Quando usar o EV/EBITDA?"],
  },
  {
    patterns: [/\blpa\b/i, /lucro.*a[çc][ãa]o/i],
    content:
      "**LPA — Lucro por Ação**\n\nValor do lucro líquido dividido pelo número total de ações da empresa.\n\n**Por que importa:** Base para calcular o P/L e para entender se a empresa está crescendo seu lucro por acionista ao longo do tempo.\n\n**Como ler:** LPA crescente ao longo dos anos é sinal de que a empresa está gerando mais valor por ação — especialmente se acompanhado de recompra de ações.",
    suggestions: ["O que é P/L?", "O que é recompra de ações?", "LPA vs lucro total?"],
  },
  {
    patterns: [/petr4?/i, /petrobras/i],
    content:
      "**Petrobras (PETR4)**\n\nEmpresa de energia com posição dominante no pré-sal brasileiro. DY historicamente elevado com sensibilidade ao preço do petróleo e risco político.\n\n**O que monitorar:**\n— Variação do Brent\n— Política de dividendos e payout\n— Endividamento e capex no pré-sal\n— Risco de mudança na paridade de preços\n\nVeja a análise completa para o diagnóstico atualizado.",
    suggestions: ["Como funciona o pré-sal?", "O que afeta o DY da Petrobras?", "Abrir análise da PETR4"],
  },
  {
    patterns: [/vale3?/i, /\bvale\b/i],
    content:
      "**Vale (VALE3)**\n\nMaior mineradora do país, com exposição dominante a minério de ferro e posição crescente em cobre e níquel.\n\n**O que monitorar:**\n— Demanda da China por aço\n— Preço do minério de ferro\n— Produção e projetos de cobre\n— Gestão de passivos ambientais\n\nVeja a análise completa para o diagnóstico atualizado.",
    suggestions: ["Como a China afeta a Vale?", "Vale vs outras mineradoras?", "O que é o projeto Salobo?"],
  },
  {
    patterns: [/wege3?/i, /\bweg\b/i],
    content:
      "**WEG (WEGE3)**\n\nEmpresa industrial de alta qualidade, referência em motores elétricos, automação e energia renovável.\n\n**O que monitorar:**\n— Crescimento da receita internacional\n— Expansão em energia renovável\n— Margens operacionais\n— ROIC vs concorrentes globais\n\nVeja a análise completa para o diagnóstico atualizado.",
    suggestions: ["Por que a WEG tem P/L alto?", "WEG tem bom ROIC?", "Comparar WEG com concorrentes"],
  },
  {
    patterns: [/o que.*voc[eê]/i, /o que.*analiso/i, /me ajud/i, /como.*funciona/i],
    content:
      "**Sou o Assistente da Analiso.**\n\nEstou aqui para ajudar você a entender empresas e métricas financeiras com clareza — sem jargão desnecessário.\n\nPosso ajudar com:\n— Explicar indicadores: P/L, DY, ROE, ROIC, margens, alavancagem\n— Contextualizar empresas da sua watchlist\n— Comparar conceitos e métricas\n— Esclarecer dúvidas de análise fundamentalista\n\nNão faço recomendação de compra ou venda.",
    suggestions: ["O que é P/L?", "Como analisar dividendos?", "O que é ROIC?"],
  },
];

const FALLBACK_CONTENT =
  "Ainda não tenho resposta pronta para isso, mas posso explicar indicadores como P/L, DY, ROE, ROIC, margens e endividamento — ou contextualizar empresas como Petrobras, Vale e WEG.\n\nTente reformular ou escolha um tema abaixo.";

const FALLBACK_SUGGESTIONS = ["O que é P/L?", "O que é Dividend Yield?", "O que é ROIC?"];

function buildResponse(question: string): Pick<ChatMessage, "content" | "suggestions"> {
  const q = question.toLowerCase();
  for (const entry of MOCK_RESPONSES) {
    if (entry.patterns.some((p) => p.test(q))) {
      return { content: entry.content, suggestions: entry.suggestions };
    }
  }
  return { content: FALLBACK_CONTENT, suggestions: FALLBACK_SUGGESTIONS };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simula latência natural de resposta
    await new Promise<void>((res) => setTimeout(res, 800 + Math.random() * 700));

    const { content, suggestions } = buildResponse(text);
    const assistantMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content,
      suggestions,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, isTyping, sendMessage, clear };
}
