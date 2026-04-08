/**
 * Definições de ferramentas (function calling) do assistente Luiz.
 *
 * Adaptado para o domínio Analiso: ações da B3, métricas fundamentalistas,
 * watchlist, comparação e navegação na plataforma.
 *
 * Segue architecture_skill.md: tipos explícitos, sem any.
 */

import type OpenAI from "openai";

export const luizTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  // ─── 1. NAVEGAR ─────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "navigate_to",
      description:
        "Navega o usuário para uma página da plataforma Analiso. Use quando o usuário quiser ir para, abrir, acessar ou ver uma tela específica.",
      parameters: {
        type: "object",
        properties: {
          page: {
            type: "string",
            enum: [
              "dashboard",
              "explorar",
              "watchlist",
              "comparar",
              "perfil",
              "assinatura",
              "preferencias",
              "seguranca",
              "onboarding",
            ],
            description: "A página de destino",
          },
          message: {
            type: "string",
            description:
              "Mensagem breve confirmando a navegação (ex: 'Levando você para o Explorador!')",
          },
        },
        required: ["page", "message"],
      },
    },
  },

  // ─── 2. FILTRAR AÇÕES ───────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "filter_stocks",
      description:
        "Aplica filtros de métricas fundamentalistas na página Explorar e navega até ela. Use quando o usuário quiser encontrar ações com características específicas (P/L baixo, DY alto, ROE elevado, etc).",
      parameters: {
        type: "object",
        properties: {
          pl_min: { type: "number", description: "P/L mínimo" },
          pl_max: { type: "number", description: "P/L máximo" },
          pvp_min: { type: "number", description: "P/VP mínimo" },
          pvp_max: { type: "number", description: "P/VP máximo" },
          dy_min: {
            type: "number",
            description: "Dividend Yield mínimo (em %)",
          },
          dy_max: {
            type: "number",
            description: "Dividend Yield máximo (em %)",
          },
          roe_min: { type: "number", description: "ROE mínimo (em %)" },
          roe_max: { type: "number", description: "ROE máximo (em %)" },
          roic_min: { type: "number", description: "ROIC mínimo (em %)" },
          margem_min: {
            type: "number",
            description: "Margem Líquida mínima (em %)",
          },
          divida_ebitda_max: {
            type: "number",
            description: "Dívida/EBITDA máximo",
          },
          ev_ebitda_max: {
            type: "number",
            description: "EV/EBITDA máximo",
          },
          setor: {
            type: "string",
            description:
              "Setor de atuação (ex: financeiro, energia, varejo, tecnologia, saude, mineracao)",
          },
          message: {
            type: "string",
            description: "Mensagem explicando os filtros aplicados",
          },
        },
        required: ["message"],
      },
    },
  },

  // ─── 3. ANALISAR EMPRESA ────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "analyze_company",
      description:
        "Abre a página de análise completa de uma empresa pelo ticker. Use quando o usuário quiser ver, analisar ou abrir uma empresa específica.",
      parameters: {
        type: "object",
        properties: {
          ticker: {
            type: "string",
            description:
              "Ticker da empresa (ex: PETR4, VALE3, ITUB4). Sempre em maiúsculas.",
          },
          message: {
            type: "string",
            description:
              "Mensagem confirmando a abertura da análise (ex: 'Abrindo a análise da Petrobras!')",
          },
        },
        required: ["ticker", "message"],
      },
    },
  },

  // ─── 4. COMPARAR EMPRESAS ──────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "compare_companies",
      description:
        "Compara duas ou mais empresas da B3 lado a lado. Use SEMPRE que o usuário mencionar 2 ou mais tickers na mesma mensagem, qualquer que seja o verbo ou conectivo. Exemplos que devem disparar esta tool: 'compara VALE3 com ITUB4', 'VALE3 vs ITUB4', 'VALE3 x ITUB4', 'VALE3 ou ITUB4?', 'qual é melhor, VALE3 ou ITUB4?', 'diferença entre VALE3 e ITUB4', 'VALE3 contra ITUB4', 'põe VALE3 e ITUB4 lado a lado', 'me mostra VALE3 frente a frente com ITUB4', ou simplesmente 'VALE3 ITUB4'. Só NÃO use se o usuário pedir explicitamente para ver as empresas separadamente. IMPORTANTÍSSIMO: se a mensagem do usuário contiver palavras de FOCO como 'dividendos', 'renda', 'valuation', 'preço', 'barato', 'rápido', 'essencial', 'profundo', 'detalhado', você DEVE preencher o parâmetro 'focus' correspondente nesta mesma chamada. Ex: 'compara VALE3 e ITUB4 focando em dividendos' → chame esta tool com focus='dividendFocus'. NÃO faça duas chamadas separadas.",
      parameters: {
        type: "object",
        properties: {
          tickers: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            description:
              "Lista de tickers para comparar (ex: ['PETR4', 'VALE3']). Sempre em maiúsculas.",
          },
          focus: {
            type: "string",
            enum: [
              "default",
              "quickCompare",
              "valuationFocus",
              "dividendFocus",
              "deepDive",
            ],
            description:
              "Template de layout opcional a aplicar já na chegada na tela. Use quando o usuário pedir comparação COM um foco específico na mesma mensagem. Ex: 'compara VALE3 e ITUB4 focando em dividendos' → focus: 'dividendFocus'. Se não houver foco explícito, omita este parâmetro.",
          },
          message: {
            type: "string",
            description: "Mensagem explicando a comparação",
          },
        },
        required: ["tickers", "message"],
      },
    },
  },

  // ─── 5. AÇÃO DA PLATAFORMA ─────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "platform_action",
      description:
        "Executa uma ação na plataforma: alterar tema, abrir glossário, adicionar/remover da watchlist. Use para ações que não são navegação nem filtro.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: [
              "toggle_theme_dark",
              "toggle_theme_light",
              "open_glossary",
              "watchlist_add",
              "watchlist_remove",
            ],
            description: "Ação a executar",
          },
          ticker: {
            type: "string",
            description:
              "Ticker da empresa (necessário para watchlist_add/remove)",
          },
          message: {
            type: "string",
            description: "Mensagem confirmando a ação",
          },
        },
        required: ["action", "message"],
      },
    },
  },

  // ─── 6. CUSTOMIZAR TELA DE COMPARAÇÃO ──────────────────────────────────
  {
    type: "function",
    function: {
      name: "apply_compare_template",
      description:
        "Aplica um template pré-fabricado na tela de Comparação, reorganizando as ilhas de análise de acordo com um foco. Use APENAS quando o usuário já está na tela de comparação (ou acabou de chegar lá) e pede para focar/priorizar/destacar algo específico. Exemplos que devem disparar: 'foca em valuation', 'quero ver só dividendos', 'me mostra só o essencial', 'análise profunda', 'volta ao padrão'.",
      parameters: {
        type: "object",
        properties: {
          templateId: {
            type: "string",
            enum: [
              "default",
              "quickCompare",
              "valuationFocus",
              "dividendFocus",
              "deepDive",
            ],
            description:
              "ID do template: default (visão completa), quickCompare (só essencial), valuationFocus (foco em preço), dividendFocus (foco em renda), deepDive (análise profunda).",
          },
          message: {
            type: "string",
            description:
              "Mensagem curta confirmando a mudança (ex: 'Focando em dividendos pra você!').",
          },
        },
        required: ["templateId", "message"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "customize_compare_view",
      description:
        "Monta um layout personalizado da tela de Comparação listando exatamente quais ilhas devem ficar visíveis, na ordem desejada. Use quando o pedido do usuário não bate em nenhum template fixo (ex: 'quero ver só valuation e crescimento', 'coloca dividendos lá em cima'). IDs válidos de ilhas: narrative, snowflake, verdict, top-factors, valuation, growth, past, health, dividend, metrics, timeline.",
      parameters: {
        type: "object",
        properties: {
          visibleOrder: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            description:
              "IDs das ilhas visíveis, na ordem desejada de cima pra baixo. Ilhas fora da lista ficam ocultas automaticamente.",
          },
          message: {
            type: "string",
            description:
              "Mensagem confirmando a customização (ex: 'Deixei só valuation e crescimento no topo').",
          },
        },
        required: ["visibleOrder", "message"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "reset_compare_view",
      description:
        "Restaura a tela de Comparação ao layout padrão de fábrica, mostrando todas as ilhas na ordem narrativa original. Use quando o usuário pedir para 'voltar ao normal', 'resetar', 'mostrar tudo de novo' ou similar.",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Mensagem curta confirmando (ex: 'Prontinho, voltei ao padrão!').",
          },
        },
        required: ["message"],
      },
    },
  },

  // ─── 7. INSIGHTS / SUGESTÕES ───────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "get_insights",
      description:
        "Gera sugestões de como usar a plataforma, próximos passos ou recomendações de análise. Use quando o usuário pedir dicas, sugestões ou não souber por onde começar.",
      parameters: {
        type: "object",
        properties: {
          focus: {
            type: "string",
            enum: [
              "como_comecar",
              "filtros_uteis",
              "indicadores_importantes",
              "setores_destaque",
              "uso_plataforma",
              "analise_geral",
            ],
            description: "Foco do insight solicitado",
          },
          context: {
            type: "string",
            description: "Contexto adicional fornecido pelo usuário",
          },
          message: {
            type: "string",
            description: "Mensagem com o insight/sugestão",
          },
        },
        required: ["focus", "message"],
      },
    },
  },
];
