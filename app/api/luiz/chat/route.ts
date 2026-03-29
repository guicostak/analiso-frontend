/**
 * POST /api/luiz/chat
 *
 * Endpoint server-side do assistente Luiz.
 * Usa OpenAI com function calling expandido (6 tools).
 * Processa tool calls em loop server-side e retorna resposta unificada.
 *
 * Segurança: OPENAI_API_KEY fica apenas no servidor.
 * Regra: nunca recomendar compra ou venda de ativos.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { LUIZ_SYSTEM_PROMPT } from "@/src/lib/ai/luiz-system-prompt";
import { luizTools } from "@/src/lib/ai/luiz-tools";
import { handleToolCall, extractSuggestions } from "@/src/lib/ai/luiz-tool-handler";

// ─── Limite de iterações do loop de tool calling ─────────────────────────────

const MAX_TOOL_CALL_ITERATIONS = 3;

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
      { role: "system", content: LUIZ_SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    // ── Loop de tool calling ──────────────────────────────────────────────
    // A OpenAI pode retornar tool_calls que precisam ser processados.
    // O loop continua até obter uma resposta final de texto ou atingir o limite.

    for (let i = 0; i < MAX_TOOL_CALL_ITERATIONS; i++) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        tools: luizTools,
        tool_choice: "auto",
        parallel_tool_calls: true,
        max_tokens: 400,
        temperature: 0.3,
      });

      const choice = completion.choices[0];
      const msg = choice.message;

      // ── Sem tool calls → resposta final ──
      if (!msg.tool_calls?.length) {
        const content =
          msg.content ?? "Desculpe, não consegui processar sua mensagem. Tente novamente.";
        return NextResponse.json({
          content,
          suggestions: extractSuggestions(content),
        });
      }

      // ── Processar tool calls ──
      // Para o Analiso, tool calls resolvem em comandos de navegação/ação.
      // Se houver uma tool call que gera um comando, retornamos direto.
      // Se for multi-step (ex: insights que precisam de follow-up), continuamos o loop.

      // Adicionar a mensagem do assistente com tool_calls ao histórico
      chatMessages.push(msg);

      let lastResponse = null;

      for (const call of msg.tool_calls) {
        if (call.type !== "function") continue;

        const args = JSON.parse(call.function.arguments ?? "{}");
        const toolResult = handleToolCall({
          name: call.function.name,
          arguments: args,
        });

        // Adicionar resultado da tool ao histórico para a OpenAI
        chatMessages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(toolResult),
        });

        // Se esta tool gerou um comando de ação, retornar direto
        if (toolResult.command) {
          lastResponse = toolResult;
        }
      }

      // Se alguma tool gerou um comando, retornar a resposta
      // (não precisa continuar o loop)
      if (lastResponse) {
        return NextResponse.json(lastResponse);
      }

      // Nenhum comando gerado; continuar loop para obter resposta textual
    }

    // Limite de iterações atingido
    return NextResponse.json({
      content: "Desculpe, a operação ficou complexa demais. Tente simplificar seu pedido.",
      suggestions: ["Explorar ações", "Como usar os filtros?", "Me explique outro indicador"],
    });
  } catch (err: unknown) {
    // Tratar erros da OpenAI com respostas amigáveis
    const isQuotaError =
      err instanceof Error && (err.message?.includes("429") || err.message?.includes("quota"));
    const isAuthError =
      err instanceof Error && (err.message?.includes("401") || err.message?.includes("Incorrect API key"));

    if (isQuotaError) {
      console.warn("[Luiz API] Quota OpenAI excedida — cliente usará mock fallback");
      return NextResponse.json(
        { error: "API temporariamente indisponível" },
        { status: 503 },
      );
    }

    if (isAuthError) {
      console.warn("[Luiz API] Chave OpenAI inválida");
      return NextResponse.json(
        { error: "API temporariamente indisponível" },
        { status: 503 },
      );
    }

    console.error("[Luiz API] Erro inesperado:", err);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 },
    );
  }
}
