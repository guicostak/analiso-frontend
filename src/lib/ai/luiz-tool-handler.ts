/**
 * Handler server-side para tool calls do Luiz.
 *
 * Processa cada tool call retornada pela OpenAI e resolve em um
 * LuizServiceResponse que o frontend já sabe consumir.
 *
 * Segue architecture_skill.md: sem any, tipos explícitos, lógica isolada.
 */

import type { LuizServiceResponse } from "@/src/features/luiz/interfaces";

// ─── Tipos internos ──────────────────────────────────────────────────────────

interface ToolCallInput {
  name: string;
  arguments: Record<string, unknown>;
}

// ─── Mapa de rotas ───────────────────────────────────────────────────────────

const PAGE_ROUTES: Record<string, string> = {
  dashboard: "/painel",
  explorar: "/explorar",
  watchlist: "/watchlist",
  comparar: "/comparar",
  perfil: "/perfil",
  assinatura: "/assinatura",
  preferencias: "/perfil/preferencias",
  seguranca: "/perfil/seguranca",
  onboarding: "/onboarding",
  busca: "/busca",
};

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  dashboard: [
    "Ver watchlist",
    "Explorar ações",
    "Comparar empresas",
  ],
  explorar: [
    "Filtrar por P/L baixo",
    "Filtrar por dividendos altos",
    "Filtrar por ROE alto",
  ],
  watchlist: [
    "Comparar ações da lista",
    "Adicionar nova ação",
    "Ver análise",
  ],
  comparar: [
    "Comparar PETR4 e VALE3",
    "Comparar por ROE",
    "Ver métricas",
  ],
  busca: [
    "Filtrar por P/L baixo",
    "Filtrar por dividendos altos",
    "Filtrar por ROE alto",
  ],
  perfil: [
    "Ver preferências",
    "Alterar senha",
    "Ver plano",
  ],
  assinatura: [
    "Ver plano atual",
    "Fazer upgrade",
    "Ver recursos PRO",
  ],
};

// ─── Handlers por tool ──────────────────────────────────────────────────────

function handleNavigate(args: Record<string, unknown>): LuizServiceResponse {
  const page = String(args.page ?? "dashboard");
  const message = String(args.message ?? "Navegando...");
  const href = PAGE_ROUTES[page] ?? "/painel";

  return {
    content: message,
    suggestions: PAGE_SUGGESTIONS[page] ?? [],
    command: { type: "navigate", href },
  };
}

function handleFilterStocks(args: Record<string, unknown>): LuizServiceResponse {
  const params = new URLSearchParams();
  const metricKeys = [
    "pl_min", "pl_max", "pvp_min", "pvp_max",
    "dy_min", "dy_max", "roe_min", "roe_max",
    "roic_min", "margem_min", "divida_ebitda_max",
    "ev_ebitda_max", "setor",
  ];

  for (const key of metricKeys) {
    if (args[key] != null) {
      params.set(key, String(args[key]));
    }
  }

  const qs = params.toString();
  return {
    content: String(args.message ?? "Filtros aplicados!"),
    suggestions: [
      "Alterar filtros",
      "Entender os indicadores",
      "Comparar resultados",
    ],
    command: {
      type: "navigate",
      href: qs ? `/busca?${qs}` : "/busca",
    },
  };
}

function handleAnalyzeCompany(args: Record<string, unknown>): LuizServiceResponse {
  const ticker = String(args.ticker ?? "").toUpperCase();
  const message = String(args.message ?? `Abrindo análise de ${ticker}...`);

  return {
    content: message,
    suggestions: [
      `Comparar ${ticker} com outra empresa`,
      `Adicionar ${ticker} na watchlist`,
      "Voltar ao dashboard",
    ],
    command: {
      type: "navigate",
      href: `/empresa/${ticker}`,
    },
  };
}

function handleCompareCompanies(args: Record<string, unknown>): LuizServiceResponse {
  const tickers = (args.tickers as string[]) ?? [];
  const message = String(args.message ?? "Abrindo comparação...");
  const tickerParams = tickers.map((t) => t.toUpperCase()).join(",");

  return {
    content: message,
    suggestions: [
      "Adicionar outra empresa",
      "Ver análise individual",
      "Voltar ao dashboard",
    ],
    command: {
      type: "navigate",
      href: tickerParams ? `/comparar?tickers=${tickerParams}` : "/comparar",
    },
  };
}

function handlePlatformAction(args: Record<string, unknown>): LuizServiceResponse {
  const action = String(args.action ?? "");
  const message = String(args.message ?? "Ação executada!");
  const ticker = args.ticker ? String(args.ticker).toUpperCase() : undefined;

  switch (action) {
    case "toggle_theme_dark":
      return {
        content: message,
        suggestions: ["Voltar ao modo claro", "Ver dashboard"],
        command: { type: "theme", href: "dark" },
      };

    case "toggle_theme_light":
      return {
        content: message,
        suggestions: ["Ativar modo escuro", "Ver dashboard"],
        command: { type: "theme", href: "light" },
      };

    case "open_glossary":
      return {
        content: message,
        suggestions: ["O que é P/L?", "O que é ROE?", "Ver indicadores"],
        command: { type: "glossary", href: "" },
      };

    case "watchlist_add":
      return {
        content: message,
        suggestions: [
          "Ver watchlist",
          ticker ? `Analisar ${ticker}` : "Explorar ações",
          "Comparar empresas",
        ],
        command: { type: "watchlist_add", href: ticker ?? "" },
      };

    case "watchlist_remove":
      return {
        content: message,
        suggestions: ["Ver watchlist", "Explorar ações"],
        command: { type: "watchlist_remove", href: ticker ?? "" },
      };

    default:
      return { content: message };
  }
}

function handleGetInsights(args: Record<string, unknown>): LuizServiceResponse {
  const message = String(args.message ?? "");

  // Insights são respostas de texto puro, sem comando de navegação
  return {
    content: message,
    suggestions: [
      "Explorar ações",
      "Me explique outro indicador",
      "Filtrar por dividendos",
    ],
  };
}

// ─── Dispatcher principal ────────────────────────────────────────────────────

/**
 * Processa uma tool call e retorna a resposta para o frontend.
 * Chamado server-side na API route.
 */
export function handleToolCall(toolCall: ToolCallInput): LuizServiceResponse {
  const { name, arguments: args } = toolCall;

  switch (name) {
    case "navigate_to":
      return handleNavigate(args);
    case "filter_stocks":
      return handleFilterStocks(args);
    case "analyze_company":
      return handleAnalyzeCompany(args);
    case "compare_companies":
      return handleCompareCompanies(args);
    case "platform_action":
      return handlePlatformAction(args);
    case "get_insights":
      return handleGetInsights(args);
    default:
      return {
        content: "Desculpe, não consegui executar essa ação. Tente de outra forma.",
      };
  }
}

/**
 * Gera sugestões contextuais baseadas no conteúdo da resposta.
 * Usado quando não há tool call (resposta de texto puro).
 */
export function extractSuggestions(content: string): string[] {
  if (/p[/.]l|lucro/i.test(content))
    return ["O que é P/VP?", "Filtrar por P/L baixo", "O que é EV/EBITDA?"];
  if (/divid/i.test(content))
    return ["Filtrar por DY alto", "O que é payout?", "Setores com mais dividendos"];
  if (/roe|roic/i.test(content))
    return ["Diferença ROE x ROIC", "Filtrar por ROE alto", "O que é margem líquida?"];
  if (/ebitda|margem/i.test(content))
    return ["O que é EV/EBITDA?", "Filtrar por margem alta", "O que é ROE?"];
  if (/d[íi]vida|alavancagem/i.test(content))
    return ["Filtrar por dívida baixa", "O que é EBITDA?", "Setores mais endividados"];
  return ["Explorar ações", "Como usar os filtros?", "Me explique outro indicador"];
}
