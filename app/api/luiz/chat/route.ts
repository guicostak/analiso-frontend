/**
 * POST /api/luiz/chat
 *
 * Endpoint server-side do assistente Luiz.
 * Usa OpenAI GPT-4o-mini com function calling para executar
 * comandos na plataforma (navegar, filtrar ações).
 *
 * Segurança: OPENAI_API_KEY fica apenas no servidor.
 * Regra: nunca recomendar compra ou venda de ativos.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é o Luiz, assistente de análise fundamentalista da plataforma Analiso.

## Identidade
- Nome: Luiz
- Tom: amigável, direto e levemente descontraído
- Idioma: sempre português brasileiro
- Respostas: concisas (máximo 120 palavras), exceto quando uma explicação mais longa for essencial
- Use **negrito** para termos técnicos importantes (ex: **P/L**, **ROE**)

## Estilo de escrita — OBRIGATÓRIO
- NUNCA use emojis em nenhuma circunstância
- NUNCA use travessão (—) nem meia-risca (–); substitua por vírgula, ponto-e-vírgula ou reescreva a frase
- Escreva de forma limpa e direta, sem ornamentos visuais

## REGRA ABSOLUTA — NUNCA VIOLAR
NUNCA recomende comprar, vender, manter ou evitar qualquer ativo financeiro.
Quando perguntado sobre o que fazer com uma ação, forneça os dados e indicadores relevantes, mas finalize com: "A decisão de investir é sempre sua. Consulte um assessor de investimentos se precisar de orientação personalizada."

## Plataforma Analiso
Você está integrado ao Analiso — plataforma de análise de ações da B3.

Páginas disponíveis (use as ferramentas para navegar):
- /dashboard — painel geral com visão do mercado
- /explorar  — busca e filtro avançado de ações por métricas
- /watchlist  — lista de ações acompanhadas pelo usuário
- /comparar   — comparação lado a lado de empresas

## Métricas que você domina
Valuation: P/L, P/VP, EV/EBITDA, LPA
Rentabilidade: Dividend Yield, ROE, ROIC
Margens: Margem Líquida, Margem EBITDA
Endividamento: Dívida/EBITDA, Dívida Líquida
Outros: CAGR Receita, Payout, FCL, VPA

## Quando usar as ferramentas
- Usuário pede para ver/filtrar ações → use filter_stocks e navegue para /explorar
- Usuário quer ir a uma página → use navigate_to
- Resposta puramente informativa → responda sem ferramentas

## Importante
- Você analisa apenas ações da B3 (Brasil)
- Não analisa cripto, forex, FIIs (por enquanto), ações americanas
- Benchmarks de indicadores variam por setor — sempre mencione isso`;

// ─── Definições de ferramentas (function calling) ────────────────────────────

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "navigate_to",
      description: "Navega o usuário para uma página específica da plataforma",
      parameters: {
        type: "object",
        properties: {
          page: {
            type: "string",
            enum: ["dashboard", "explorar", "watchlist", "comparar"],
            description: "A página de destino",
          },
          message: {
            type: "string",
            description: "Mensagem breve confirmando a navegação (ex: 'Levando você para o Explorador!')",
          },
        },
        required: ["page", "message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "filter_stocks",
      description:
        "Aplica filtros de métricas na página de exploração de ações e navega até ela. Use quando o usuário quiser encontrar ações com características específicas.",
      parameters: {
        type: "object",
        properties: {
          pl_min:   { type: "number", description: "P/L mínimo" },
          pl_max:   { type: "number", description: "P/L máximo" },
          pvp_min:  { type: "number", description: "P/VP mínimo" },
          pvp_max:  { type: "number", description: "P/VP máximo" },
          dy_min:   { type: "number", description: "Dividend Yield mínimo (em %)" },
          dy_max:   { type: "number", description: "Dividend Yield máximo (em %)" },
          roe_min:  { type: "number", description: "ROE mínimo (em %)" },
          roe_max:  { type: "number", description: "ROE máximo (em %)" },
          roic_min: { type: "number", description: "ROIC mínimo (em %)" },
          message:  { type: "string", description: "Mensagem explicando os filtros aplicados" },
        },
        required: ["message"],
      },
    },
  },
];

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Verificar API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith("sk-proj-your_")) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada. Adicione sua chave em .env.local" },
      { status: 503 },
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const body = await req.json();
    const { message, history = [] } = body as {
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    // Montar histórico para a API
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10), // máximo 10 mensagens de contexto
      { role: "user", content: message },
    ];

    // Chamada principal
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 400,
      temperature: 0.7,
    });

    const choice = completion.choices[0];
    const msg = choice.message;

    // ── Processar tool call ──
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      const call = msg.tool_calls[0];
      // type narrowing: apenas tool_calls do tipo "function"
      if (call.type !== "function") {
        return NextResponse.json({ content: msg.content ?? "" });
      }
      const fnCall = call as OpenAI.Chat.Completions.ChatCompletionMessageToolCall & { type: "function" };
      const args = JSON.parse(fnCall.function.arguments ?? "{}");

      if (fnCall.function.name === "navigate_to") {
        const pageHref: Record<string, string> = {
          dashboard: "/dashboard",
          explorar:  "/explorar",
          watchlist: "/watchlist",
          comparar:  "/comparar",
        };
        return NextResponse.json({
          content: args.message ?? "Navegando...",
          suggestions: getSuggestionsForPage(args.page),
          command: {
            type: "navigate",
            href: pageHref[args.page] ?? "/dashboard",
          },
        });
      }

      if (fnCall.function.name === "filter_stocks") {
        const params = new URLSearchParams();
        if (args.pl_min   != null) params.set("pl_min",   String(args.pl_min));
        if (args.pl_max   != null) params.set("pl_max",   String(args.pl_max));
        if (args.pvp_min  != null) params.set("pvp_min",  String(args.pvp_min));
        if (args.pvp_max  != null) params.set("pvp_max",  String(args.pvp_max));
        if (args.dy_min   != null) params.set("dy_min",   String(args.dy_min));
        if (args.dy_max   != null) params.set("dy_max",   String(args.dy_max));
        if (args.roe_min  != null) params.set("roe_min",  String(args.roe_min));
        if (args.roe_max  != null) params.set("roe_max",  String(args.roe_max));
        if (args.roic_min != null) params.set("roic_min", String(args.roic_min));

        const qs = params.toString();
        return NextResponse.json({
          content: args.message ?? "Filtros aplicados!",
          suggestions: ["Ver resultados", "Alterar filtros", "Entender os indicadores"],
          command: {
            type: "navigate",
            href: qs ? `/explorar?${qs}` : "/explorar",
          },
        });
      }
    }

    // ── Resposta de texto comum ──
    const content = msg.content ?? "Desculpe, não consegui processar sua mensagem. Tente novamente.";

    return NextResponse.json({
      content,
      suggestions: extractSuggestions(content),
    });
  } catch (err) {
    console.error("[Luiz API] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 },
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSuggestionsForPage(page: string): string[] {
  const map: Record<string, string[]> = {
    dashboard: ["Ver watchlist", "Explorar ações", "Comparar empresas"],
    explorar:  ["Filtrar por P/L baixo", "Filtrar por dividendos altos", "Filtrar por ROE alto"],
    watchlist: ["Comparar ações da lista", "Adicionar nova ação", "Ver análise"],
    comparar:  ["Comparar PETR4 e VALE3", "Comparar por ROE", "Ver métricas"],
  };
  return map[page] ?? [];
}

function extractSuggestions(content: string): string[] {
  // Gera sugestões contextuais simples baseadas no conteúdo
  if (/p[\/.]l|lucro/i.test(content))       return ["O que é P/VP?", "Filtrar por P/L baixo", "O que é EV/EBITDA?"];
  if (/divid/i.test(content))                return ["Filtrar por DY alto", "O que é payout?", "Setores com mais dividendos"];
  if (/roe|roic/i.test(content))             return ["Diferença ROE x ROIC", "Filtrar por ROE alto", "O que é margem líquida?"];
  if (/ebitda|margem/i.test(content))        return ["O que é EV/EBITDA?", "Filtrar por margem alta", "O que é ROE?"];
  if (/d[íi]vida|alavancagem/i.test(content)) return ["Filtrar por dívida baixa", "O que é EBITDA?", "Setores mais endividados"];
  return ["Explorar ações", "Como usar os filtros?", "Me explique outro indicador"];
}
