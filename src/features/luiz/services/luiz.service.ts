/**
 * luiz.service.ts
 *
 * Camada de serviço do assistente Luiz.
 * Prioridade: API real (OpenAI via /api/luiz/chat)
 * Fallback:   respostas mock quando a API não está disponível
 *
 * Arquitetura seguindo architecture_skill.md:
 * - Separação total entre serviço e UI
 * - Hook não precisa saber se é mock ou real
 */

import type { LuizHistoryEntry, LuizServiceResponse } from "../interfaces";

// ─── API real ─────────────────────────────────────────────────────────────────

async function callAPI(
  message: string,
  history: LuizHistoryEntry[],
): Promise<LuizServiceResponse> {
  const res = await fetch("/api/luiz/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Mock (fallback) ──────────────────────────────────────────────────────────

interface ResponsePattern {
  regex: RegExp;
  response: LuizServiceResponse;
}

const MOCK_PATTERNS: ResponsePattern[] = [
  {
    regex: /\b(p[/.]l|p\.l|preco[- ]lucro|preço[- ]lucro)\b/i,
    response: {
      content:
        "O **P/L (Preco/Lucro)** mostra quanto o mercado paga por cada real de lucro da empresa.\n\nUm P/L de 12 significa 12 anos de lucro atual para recuperar o investimento.\n\n• Abaixo de 10: pode estar barato\n• 10 a 20: razoavel para maioria dos setores\n• Acima de 30: mercado precifica crescimento forte\n\nSempre compare dentro do mesmo setor.",
      suggestions: ["Filtrar empresas com P/L baixo", "O que é P/VP?", "O que é EV/EBITDA?"],
      delay: 900,
    },
  },
  {
    regex: /\b(pvp|p[/.]vp|valor patrimonial)\b/i,
    response: {
      content:
        "O **P/VP** compara o preco de mercado com o patrimônio contábil.\n\n• P/VP menor que 1: empresa vale menos na bolsa do que seus ativos\n• Entre 1 e 3: saudável para a maioria\n• Acima de 5: mercado paga muito além dos ativos",
      suggestions: ["O que é P/L?", "O que é ROE?", "Filtrar por P/VP baixo"],
      delay: 800,
    },
  },
  {
    regex: /\b(ev.?ebitda|enterprise value)\b/i,
    response: {
      content:
        "O **EV/EBITDA** compara o valor total da empresa, incluindo dividas, com sua geração de caixa operacional.\n\n• Abaixo de 6x: potencialmente barato\n• Entre 6 e 12x: faixa razoável\n• Acima de 15x: empresa cara ou com alto crescimento esperado",
      suggestions: ["O que é EBITDA?", "O que é P/L?"],
      delay: 900,
    },
  },
  {
    regex: /\b(dividend.?yield|dy|dividendo|provento)\b/i,
    response: {
      content:
        "O **Dividend Yield (DY)** é a porcentagem do valor da ação distribuída em dividendos por ano.\n\nSe a ação vale R$20 e distribui R$2, o DY é 10%.\n\n**Atencao:** DY muito alto pode indicar queda no preco, nao aumento dos dividendos.\n\nDY consistente acima de 5 a 6% indica boa pagadora.",
      suggestions: ["Filtrar por DY acima de 5%", "O que é ROE?", "O que é Payout?"],
      delay: 900,
    },
  },
  {
    regex: /\b(roe|return on equity|retorno sobre patrimônio)\b/i,
    response: {
      content:
        "O **ROE** mede a eficiência em gerar lucro com o dinheiro dos acionistas.\n\nROE de 20% significa R$20 de lucro para cada R$100 dos sócios.\n\n• Abaixo de 10%: rentabilidade baixa\n• Entre 15 e 25%: bom na maioria dos setores\n• Acima de 30%: excelente\n\nCuidado: ROE muito alto pode indicar alavancagem excessiva.",
      suggestions: ["O que é ROIC?", "Filtrar por ROE alto", "Diferença ROE x ROIC"],
      delay: 800,
    },
  },
  {
    regex: /\b(roic|retorno sobre capital)\b/i,
    response: {
      content:
        "O **ROIC** mede o retorno sobre todo o capital investido, dos acionistas e credores. É mais completo que o ROE.\n\n**Regra de ouro:** ROIC acima do custo de capital (WACC) significa empresa criando valor real. Abaixo disso, ela destroi valor mesmo com lucro positivo.",
      suggestions: ["O que é ROE?", "Filtrar por ROIC alto", "O que é EBITDA?"],
      delay: 800,
    },
  },
  {
    regex: /\b(margem.?l[ií]quida|lucro.?l[ií]quido)\b/i,
    response: {
      content:
        "A **Margem Liquida** mostra quanto sobra de lucro para cada R$1 de receita, após todos os custos, juros e impostos.\n\nVaria muito por setor:\n• Varejo: 2 a 5% é normal\n• Bancos: 15 a 25%\n• Tecnologia: pode passar de 30%",
      suggestions: ["O que é Margem EBITDA?", "O que é ROE?"],
      delay: 800,
    },
  },
  {
    regex: /\b(ebitda|geração de caixa)\b/i,
    response: {
      content:
        "O **EBITDA** é o lucro antes de juros, impostos, depreciação e amortização, ou seja, o caixa gerado pela operação pura.\n\nElimina o efeito da estrutura de capital, facilitando comparar empresas de diferentes países.",
      suggestions: ["O que é EV/EBITDA?", "O que é Margem Líquida?"],
      delay: 800,
    },
  },
  {
    regex: /\b(d[ií]vida.?ebitda|alavancagem|endividamento)\b/i,
    response: {
      content:
        "A relação **Divida/EBITDA** mostra em quantos anos a empresa pagaria sua divida com o caixa atual.\n\n• Abaixo de 1x: pouco alavancada\n• Entre 1 e 2x: saudável\n• Entre 2 e 3x: atenção\n• Acima de 4x: alavancagem elevada\n\nExceção: energia elétrica e saneamento naturalmente operam com indices mais altos.",
      suggestions: ["Filtrar por dívida baixa", "O que é EBITDA?"],
      delay: 900,
    },
  },
  {
    regex: /^(oi|ol[aá]|hey|hello|bom dia|boa tarde|boa noite|salve|tudo)\b/i,
    response: {
      content:
        "Oi! Sou o **Luiz**, seu assistente de análise. Posso te ajudar a entender indicadores, navegar pelos filtros ou tirar dúvidas sobre empresas. Como posso ajudar?",
      suggestions: ["Explicar um indicador", "Filtrar ações", "Como usar a plataforma"],
      delay: 600,
    },
  },
  {
    regex: /\b(obrigad[oa]|valeu|thanks|grat[oa]|perfeito|ótimo|show|top)\b/i,
    response: {
      content: "Fico feliz em ajudar. Qualquer dúvida é só chamar. Boas análises!",
      suggestions: ["Explorar empresas", "Ver filtros avançados"],
      delay: 500,
    },
  },
];

const MOCK_FALLBACK: LuizServiceResponse = {
  content:
    "Ainda estou aprendendo sobre isso. Posso te ajudar com indicadores financeiros, navegar pela plataforma ou filtrar ações por métricas. O que prefere?",
  suggestions: ["Explicar P/L", "O que é ROE?", "Filtrar ações"],
  delay: 700,
};

function getMockResponse(message: string): LuizServiceResponse {
  const normalized = message.toLowerCase().trim();
  const match = MOCK_PATTERNS.find((p) => p.regex.test(normalized));
  return match?.response ?? MOCK_FALLBACK;
}

// ─── Serviço público ──────────────────────────────────────────────────────────

export const luizService = {
  /**
   * Retorna uma resposta para a mensagem do usuário.
   * Tenta a API real primeiro; cai no mock se indisponível.
   *
   * @param message    Mensagem atual do usuário
   * @param history    Histórico da conversa para contexto
   */
  async getResponse(
    message: string,
    history: LuizHistoryEntry[] = [],
  ): Promise<LuizServiceResponse> {
    try {
      return await callAPI(message, history);
    } catch (err) {
      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV === "development") {
        console.warn("[Luiz] API indisponível — usando mock:", err);
      }
      // Fallback com delay simulado
      const mock = getMockResponse(message);
      return new Promise((resolve) =>
        setTimeout(() => resolve(mock), mock.delay ?? 700),
      );
    }
  },
};
