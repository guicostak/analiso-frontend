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
    // Don't surface raw HTTP status to the caller — luizService catches this
    // and silently falls back to mock responses, which is the desired UX.
    throw new Error("luiz_api_unavailable");
  }

  return res.json();
}

// ─── Mock (fallback) ──────────────────────────────────────────────────────────

interface ResponsePattern {
  regex: RegExp;
  response: LuizServiceResponse;
}

const MOCK_PATTERNS: ResponsePattern[] = [
  // ── AÇÕES (filtrar, navegar, comparar, analisar) — prioridade alta ─────

  {
    regex: /filtrar?.*(dy|dividend|dividendo).*(\d+)/i,
    response: {
      content: "Filtrando ações com **Dividend Yield** acima do valor indicado. Levando você para o Explorador!",
      suggestions: ["Alterar filtros", "O que é DY?", "Filtrar por ROE alto"],
      command: { type: "navigate", href: "/busca?dy_min=5" },
      delay: 600,
    },
  },
  {
    regex: /filtrar?.*(p[/.]?l|preco.?lucro).*(\d+)/i,
    response: {
      content: "Filtrando ações por **P/L**. Levando você para o Explorador!",
      suggestions: ["Alterar filtros", "O que é P/L?", "Filtrar por DY alto"],
      command: { type: "navigate", href: "/busca?pl_max=15" },
      delay: 600,
    },
  },
  {
    regex: /filtrar?.*(p[/.]?l|preco.?lucro).*(baixo|menor)/i,
    response: {
      content: "Filtrando ações com **P/L** baixo (abaixo de 10). Levando você para o Explorador!",
      suggestions: ["Alterar filtros", "O que é P/L?", "Filtrar por DY alto"],
      command: { type: "navigate", href: "/busca?pl_max=10" },
      delay: 600,
    },
  },
  {
    regex: /filtrar?.*(roe).*(alto|acima|\d+)/i,
    response: {
      content: "Filtrando ações com **ROE** alto. Levando você para o Explorador!",
      suggestions: ["Alterar filtros", "O que é ROE?", "Filtrar por DY alto"],
      command: { type: "navigate", href: "/busca?roe_min=15" },
      delay: 600,
    },
  },
  {
    regex: /filtrar?.*(pvp|p[/.]?vp).*(baixo|menor|\d+)/i,
    response: {
      content: "Filtrando ações com **P/VP** baixo. Levando você para o Explorador!",
      suggestions: ["Alterar filtros", "O que é P/VP?", "Filtrar por ROE alto"],
      command: { type: "navigate", href: "/busca?pvp_max=1.5" },
      delay: 600,
    },
  },
  {
    regex: /filtrar?.*(d[ií]vida|endividamento).*(baixo|menor)/i,
    response: {
      content: "Filtrando ações com **endividamento baixo**. Levando você para o Explorador!",
      suggestions: ["Alterar filtros", "O que é Dívida/EBITDA?", "Filtrar por ROE alto"],
      command: { type: "navigate", href: "/busca?divida_ebitda_max=2" },
      delay: 600,
    },
  },
  {
    regex: /filtrar?.*(margem).*(alta|acima|\d+)/i,
    response: {
      content: "Filtrando ações com **Margem Líquida** alta. Levando você para o Explorador!",
      suggestions: ["Alterar filtros", "O que é Margem Líquida?", "Filtrar por ROE alto"],
      command: { type: "navigate", href: "/busca?margem_min=15" },
      delay: 600,
    },
  },
  {
    regex: /filtrar|buscar a[çc][õo]es|encontrar a[çc][õo]es/i,
    response: {
      content: "Levando você para a busca com filtros avançados!",
      suggestions: ["Filtrar por P/L baixo", "Filtrar por DY alto", "Filtrar por ROE alto"],
      command: { type: "navigate", href: "/buscar" },
      delay: 600,
    },
  },
  {
    regex: /\b(ir|abrir|acessar|navegar|leva|vai).*(dashboard|painel)/i,
    response: {
      content: "Levando você para o Painel de Hoje!",
      suggestions: ["Ver watchlist", "Explorar ações", "Comparar empresas"],
      command: { type: "navigate", href: "/painel" },
      delay: 500,
    },
  },
  {
    regex: /\b(ir|abrir|acessar|navegar|leva|vai).*(explorar|explorador)/i,
    response: {
      content: "Levando você para a busca de ações!",
      suggestions: ["Filtrar por P/L baixo", "Filtrar por DY alto", "Filtrar por ROE alto"],
      command: { type: "navigate", href: "/buscar" },
      delay: 500,
    },
  },
  {
    regex: /\b(ir|abrir|acessar|navegar|leva|vai).*(watchlist|lista)/i,
    response: {
      content: "Levando você para a Watchlist!",
      suggestions: ["Comparar ações da lista", "Explorar mais ações", "Ver dashboard"],
      command: { type: "navigate", href: "/watchlist" },
      delay: 500,
    },
  },
  {
    regex: /\b(ir|abrir|acessar|navegar|leva|vai).*(comparar|compara[çc][ãa]o)/i,
    response: {
      content: "Levando você para a página de Comparação!",
      suggestions: ["Comparar PETR4 e VALE3", "Comparar por ROE", "Ver métricas"],
      command: { type: "navigate", href: "/comparar" },
      delay: 500,
    },
  },
  // Nota: a detecção de comparação por tickers é feita ANTES dos patterns
  // (em detectCompareIntent), não como regex aqui. Qualquer mensagem que
  // contenha 2+ tickers B3 distintos é interpretada como comparação,
  // independente do verbo usado ("compara", "vs", "ou", "x", "contra",
  // "diferença entre", ou apenas "VALE3 ITUB4").
  {
    regex: /\b(ver|abrir|analisar|mostra|quero ver)\b.*\b([A-Z]{4}\d{1,2})\b/i,
    response: {
      content: "Abrindo a análise da empresa!",
      suggestions: ["Ver watchlist", "Comparar com outra empresa", "Voltar ao dashboard"],
      command: { type: "navigate", href: "/analysis/TICKER" },
      delay: 600,
    },
  },
  {
    regex: /\b(modo escuro|dark mode|tema escuro|ativar dark)/i,
    response: {
      content: "Ativando o modo escuro!",
      suggestions: ["Voltar ao modo claro", "Ver dashboard"],
      command: { type: "theme", href: "dark" },
      delay: 400,
    },
  },
  {
    regex: /\b(modo claro|light mode|tema claro|ativar light)/i,
    response: {
      content: "Ativando o modo claro!",
      suggestions: ["Ativar modo escuro", "Ver dashboard"],
      command: { type: "theme", href: "light" },
      delay: 400,
    },
  },

  // ── EDUCATIVAS — prioridade baixa (matcham por último) ─────────────────

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

  // ── SAUDAÇÕES E AGRADECIMENTOS ─────────────────────────────────────────

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

/**
 * Extrai todos os tickers B3 únicos (formato XXXX9 ou XXXX99) de uma string.
 * - Case-insensitive na entrada, normaliza para uppercase
 * - Preserva a ordem de aparição
 * - Limita ao máximo passado em maxCount (default 4)
 */
function extractB3Tickers(message: string, maxCount = 4): string[] {
  const matches = message.match(/\b[A-Za-z]{4}\d{1,2}\b/g) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of matches) {
    const t = raw.toUpperCase();
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= maxCount) break;
  }
  return out;
}

/**
 * Detecta se a mensagem expressa intenção de COMPARAÇÃO.
 *
 * Regra principal: se a mensagem contém 2+ tickers B3 distintos, considera
 * comparação. Isso cobre todas as variações naturais ("compara X com Y",
 * "X vs Y", "X ou Y?", "diferença entre X e Y", "X x Y", "X contra Y",
 * "qual é melhor, X ou Y?", "põe X e Y lado a lado", ou apenas "X Y").
 *
 * Exceção: se a mensagem usa um verbo claramente individual ("ver", "abrir",
 * "analisar") seguido de UM ticker, não é comparação — isso é capturado pelo
 * pattern individual de análise mais adiante.
 */
/**
 * Detecta foco semântico da comparação no texto (Fase 3 generative UI).
 * Usado para injetar `&focus=<templateId>` na URL quando o usuário pede
 * comparação + foco na mesma mensagem.
 */
function detectCompareFocus(message: string): string {
  const t = message.toLowerCase();
  if (/divid|renda passiva|yield|\bdy\b/.test(t)) return "dividendFocus";
  if (/valuation|pre[çc]o|barat|car[oa]|p\/l|p\/vp|m[úu]ltipl/.test(t)) return "valuationFocus";
  if (/r[áa]pid|essencial|resumo|breve|express|curt/.test(t)) return "quickCompare";
  if (/profund|detalhad|aprofund|\btudo\b|completa/.test(t)) return "deepDive";
  return "";
}

function detectCompareIntent(message: string): LuizServiceResponse | null {
  const tickers = extractB3Tickers(message, 4);
  if (tickers.length < 2) return null;

  // Edge case: "ver VALE3 e PETR4 separadamente" — se há "separad" na frase,
  // não é comparação.
  if (/\bsepara(d[oa]?|damente)\b/i.test(message)) return null;

  const [a, b] = tickers;
  const focus = detectCompareFocus(message);
  const focusSuffix = focus ? `&focus=${focus}` : "";
  console.log("[MOCK detectCompareIntent]", { message, tickers, focus, focusSuffix });
  const focusNote = focus
    ? focus === "dividendFocus"
      ? " focando em **dividendos**"
      : focus === "valuationFocus"
        ? " focando em **valuation**"
        : focus === "quickCompare"
          ? " no modo **rápido**"
          : " no modo **profundo**"
    : "";

  return {
    content: `Vou montar a comparação entre **${a}** e **${b}**${focusNote} para você...`,
    suggestions: [
      "Adicionar outra empresa",
      "Ver análise individual",
      "Voltar ao dashboard",
    ],
    command: {
      type: "navigate",
      href: `/comparar?tickers=${a},${b}&build=1${focusSuffix}`,
    },
    delay: 600,
  };
}

function getMockResponse(message: string): LuizServiceResponse {
  // 1) Short-circuit: comparação por presença de 2+ tickers (qualquer verbo)
  const compare = detectCompareIntent(message);
  if (compare) return compare;

  const normalized = message.toLowerCase().trim();
  const match = MOCK_PATTERNS.find((p) => p.regex.test(normalized));
  if (!match) return MOCK_FALLBACK;

  const response = { ...match.response };

  // Extrair ticker da mensagem para comandos que precisam
  if (response.command?.href === "/analysis/TICKER") {
    const tickerMatch = message.match(/\b([A-Z]{4}\d{1,2})\b/i);
    const ticker = tickerMatch?.[1]?.toUpperCase() ?? "";
    if (ticker) {
      response.command = { ...response.command, href: `/analysis/${ticker}` };
      response.content = `Abrindo a análise de **${ticker}**!`;
      response.suggestions = [
        `Comparar ${ticker} com outra empresa`,
        `Adicionar ${ticker} na watchlist`,
        "Voltar ao dashboard",
      ];
    } else {
      // Sem ticker identificado, navegar para explorar
      response.command = { type: "navigate", href: "/buscar" };
      response.content = "Não identifiquei o ticker. Levando você para a busca de ações!";
    }
  }

  // Extrair valor numérico para filtros de DY
  if (response.command?.href === "/busca?dy_min=5") {
    const numMatch = message.match(/(\d+)/);
    if (numMatch) {
      response.command = { ...response.command, href: `/busca?dy_min=${numMatch[1]}` };
    }
  }

  return response;
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
