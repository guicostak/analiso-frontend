/**
 * IslandRegistry
 *
 * Registro central das ilhas disponíveis no `DashboardCanvas`. Cada entrada
 * associa um `IslandKind` a:
 *   - o componente React que renderiza a ilha
 *   - os metadados estáticos (`IslandMeta`) — label, descrição, ícone,
 *     categoria, baseSize no grid de 12 colunas e configSchema.
 *
 * **Lazy-loading via `next/dynamic`**: cada ilha é seu próprio chunk JS,
 * baixado on-demand. Reduz drasticamente o bundle inicial de `/painel`
 * (antes carregava os 25 componentes mesmo pra usuários que não usam).
 *
 * **Pré-warm coordenado**: o `useDashboardPrefetch` chama `preload()` em
 * cada ilha presente no layout durante a tela de loading — paralelo aos
 * data fetches. Quando a ilha renderiza, o chunk já está em memória.
 *
 * Fallback durante download: `IslandSkeleton` (placeholder pulse que ocupa
 * a célula inteira pra manter o grid estável — zero CLS).
 *
 * Tamanhos canônicos pós-MVP:
 *   - 4×1 / 4×2  (compactos)
 *   - 6×3        (médios, 1/2 width)
 *   - 12×1 / 12×3 (full width)
 */

import { createElement, type ComponentType } from "react";
import dynamic from "next/dynamic";

import type {
  IslandComponent,
  IslandConfig,
  IslandMeta,
  IslandSize,
} from "../interfaces/island.types";
import type { IslandKind } from "../interfaces/layout.types";

import { IslandSkeleton } from "../components/shared/IslandSkeleton";

// ─── Helper de lazy import ───────────────────────────────────────────────────
// Wrapper sobre `next/dynamic` configurado pra ilhas:
//   - `loading`: skeleton ocupando a célula inteira (mantém grid estável,
//     zero CLS quando a ilha real renderiza).
//   - `ssr: false`: ilhas usam localStorage / IntersectionObserver /
//     ResizeObserver — inúteis no servidor, e SSR delas geraria warnings
//     de hydration mismatch.
//
// Componentes retornados expõem `preload()` (do next/dynamic) — usado pelo
// `useDashboardPrefetch` durante a tela de loading pra baixar JS sem
// montar componente. Tempo total da loading vira `max(dados, JS)` em vez
// de `dados + JS`.

function lazyIsland(
  importer: () => Promise<Record<string, unknown>>,
  exportName: string,
): IslandComponent {
  return dynamic(
    () => importer().then((mod) => mod[exportName] as ComponentType<unknown>),
    {
      loading: () => createElement(IslandSkeleton),
      ssr: false,
    },
  ) as unknown as IslandComponent;
}

// Cada ilha vira chunk próprio. Bundle inicial agora carrega só este
// registry (metadados leves) + IslandSkeleton.
const PrioridadeDoDiaIsland     = lazyIsland(() => import("../components/islands/PrioridadeDoDiaIsland"),     "PrioridadeDoDiaIsland");
const FeedMudancasIsland        = lazyIsland(() => import("../components/islands/FeedMudancasIsland"),        "FeedMudancasIsland");
const AgendaIsland              = lazyIsland(() => import("../components/islands/AgendaIsland"),              "AgendaIsland");
const SinaisWatchlistIsland     = lazyIsland(() => import("../components/islands/SinaisWatchlistIsland"),     "SinaisWatchlistIsland");
const CicloMercadoIsland        = lazyIsland(() => import("../components/islands/CicloMercadoIsland"),        "CicloMercadoIsland");
const SugeridosIsland           = lazyIsland(() => import("../components/islands/SugeridosIsland"),           "SugeridosIsland");
const NotificacoesIsland        = lazyIsland(() => import("../components/islands/NotificacoesIsland"),        "NotificacoesIsland");
const PerformanceVsIbovIsland   = lazyIsland(() => import("../components/islands/PerformanceVsIbovIsland"),   "PerformanceVsIbovIsland");
const NoticiasMercadoIsland     = lazyIsland(() => import("../components/islands/NoticiasMercadoIsland"),     "NoticiasMercadoIsland");
const PanoramaGlobalIsland      = lazyIsland(() => import("../components/islands/PanoramaGlobalIsland"),      "PanoramaGlobalIsland");
const ResumoIndicesIsland       = lazyIsland(() => import("../components/islands/ResumoIndicesIsland"),       "ResumoIndicesIsland");
const MacroGlobalIsland         = lazyIsland(() => import("../components/islands/MacroGlobalIsland"),         "MacroGlobalIsland");
const MacroBrasilIsland         = lazyIsland(() => import("../components/islands/MacroBrasilIsland"),         "MacroBrasilIsland");
const AtalhoWatchlistIsland     = lazyIsland(() => import("../components/islands/AtalhoWatchlistIsland"),     "AtalhoWatchlistIsland");
const HeatmapSetorialIsland     = lazyIsland(() => import("../components/islands/HeatmapSetorialIsland"),     "HeatmapSetorialIsland");
const VolatilidadeIsland        = lazyIsland(() => import("../components/islands/VolatilidadeIsland"),        "VolatilidadeIsland");
const MoodMercadoIsland         = lazyIsland(() => import("../components/islands/MoodMercadoIsland"),         "MoodMercadoIsland");
const FearGreedIsland           = lazyIsland(() => import("../components/islands/FearGreedIsland"),           "FearGreedIsland");
const BreadthMercadoIsland      = lazyIsland(() => import("../components/islands/BreadthMercadoIsland"),      "BreadthMercadoIsland");
const VixDxyIsland              = lazyIsland(() => import("../components/islands/VixDxyIsland"),              "VixDxyIsland");
const CurvaDiIsland             = lazyIsland(() => import("../components/islands/CurvaDiIsland"),             "CurvaDiIsland");
const ComparacoesMacroIsland    = lazyIsland(() => import("../components/islands/ComparacoesMacroIsland"),    "ComparacoesMacroIsland");
const AlfaSetorialIsland        = lazyIsland(() => import("../components/islands/AlfaSetorialIsland"),        "AlfaSetorialIsland");
const ExDividendosIsland        = lazyIsland(() => import("../components/islands/ExDividendosIsland"),        "ExDividendosIsland");
const SectionHeaderIsland       = lazyIsland(() => import("../components/islands/SectionHeaderIsland"),       "SectionHeaderIsland");

export interface IslandRegistryEntry {
  meta:      IslandMeta;
  component: IslandComponent;
}

// ─── Helpers de tamanho ──────────────────────────────────────────────────────

function fixedSize(w: number, h: number): IslandSize {
  return { w, h };
}

/** Cresce verticalmente conforme `itemCount`. */
function sinaisWatchlistComputeSize(config: IslandConfig): IslandSize {
  const count = config.itemCount ?? 5;
  if (count <= 3)  return { w: 6, h: 3 };
  if (count <= 5)  return { w: 6, h: 4 };
  return { w: 6, h: 6 };
}

// ─── Registro ────────────────────────────────────────────────────────────────

const ENTRIES: IslandRegistryEntry[] = [
  {
    meta: {
      kind: "prioridade_dia",
      label: "Prioridade do dia",
      description: "Item-âncora com CTA pré-selecionado (Default Effect).",
      icon: "Target",
      baseSize: fixedSize(4, 2),
      category: "core",
      // Card simples (título + linha de valor + CTA) — esticar pra 6 cols
      // dá mais respiro pro texto sem distorcer o layout. h cresce até 3
      // pra alinhar com 6×3 vizinhos.
      growConstraints: { maxW: 6, maxH: 3, growable: ["w", "h"] },
    },
    component: PrioridadeDoDiaIsland,
  },
  {
    meta: {
      kind: "feed_mudancas",
      label: "Mudanças que importam",
      description: "Feed curado com impacto, fonte e data.",
      icon: "Activity",
      baseSize: fixedSize(12, 3),
      category: "core",
    },
    component: FeedMudancasIsland,
  },
  {
    meta: {
      kind: "agenda",
      label: "Agenda",
      description: "Próximos eventos relevantes da watchlist.",
      icon: "Calendar",
      baseSize: fixedSize(4, 2),
      category: "contexto",
      // Lista vertical curta — esticar até 6 cols só amplia o ar lateral.
      // h cresce até 3 pra mostrar mais events na lista quando alinhada
      // com vizinhos 6×3.
      growConstraints: { maxW: 6, maxH: 3, growable: ["w", "h"] },
    },
    component: AgendaIsland,
  },
  {
    meta: {
      kind: "sinais_watchlist",
      label: "Sinais da watchlist",
      description: "Sinais técnicos com fonte (Confidence Building).",
      icon: "Radio",
      baseSize: fixedSize(6, 3),
      category: "contexto",
      configSchema: {
        itemCount: { label: "Itens visíveis", options: [3, 5, 10], default: 5 },
      },
      computeSize: sinaisWatchlistComputeSize,
      // Lista de sinais — escala linearmente com largura.
      growConstraints: { maxW: 12, growable: ["w"] },
    },
    component: SinaisWatchlistIsland,
  },
  {
    meta: {
      kind: "ciclo_mercado",
      label: "Ciclo de mercado",
      description: "Onde estamos no ciclo macro.",
      icon: "Compass",
      baseSize: fixedSize(4, 2),
      category: "contexto",
      // Mini-clock + texto da fase. Em w=6, o relógio fica mais à esquerda
      // e o texto ganha espaço — visualmente OK. h cresce até 3 (alinha
      // com 6×3 vizinhos; mais espaço vertical = relógio maior).
      growConstraints: { maxW: 6, maxH: 3, growable: ["w", "h"] },
    },
    component: CicloMercadoIsland,
  },
  {
    // `kind` continua "sugeridos" pra estabilidade da chave persistida no
    // backend (já existe em layouts salvos). O LABEL visível é "Recentes".
    meta: {
      kind: "sugeridos",
      label: "Recentes",
      description: "Histórico unificado: empresas visitadas, buscas feitas e comparações criadas.",
      icon: "History",
      baseSize: fixedSize(6, 5),
      category: "acumulo",
      // 3 sub-seções de altura igual. Em w=12 cada sub-seção fica mais
      // larga; layout vertical não muda.
      growConstraints: { maxW: 12, growable: ["w"] },
    },
    component: SugeridosIsland,
  },
  {
    meta: {
      kind: "notificacoes",
      label: "Notificações",
      description: "Resumo de notificações não lidas + últimas.",
      icon: "Bell",
      baseSize: fixedSize(4, 2),
      category: "acumulo",
      // maxH=5 (era 3) — quando ao lado de `noticias_mercado` (6×5),
      // o packer estica notificacoes pra alcançar a mesma altura, sem
      // deixar gap visual abaixo. Lista vertical aceita altura grande
      // sem distorção (entries empilham; empty state centra naturalmente).
      growConstraints: { maxW: 6, maxH: 5, growable: ["w", "h"] },
    },
    component: NotificacoesIsland,
  },
  // ─── Fase 3 — Previews de outras features ──────────────────────────────────
  {
    meta: {
      kind: "performance_vs_ibov",
      label: "Watchlist vs IBOV",
      description: "Performance equal-weight da watchlist vs IBOV em 90 dias + alpha.",
      icon: "LineChart",
      baseSize: fixedSize(6, 3),
      category: "core",
    },
    component: PerformanceVsIbovIsland,
  },
  {
    meta: {
      kind: "noticias_mercado",
      label: "Notícias",
      description: "Manchetes da sua watchlist + manchetes gerais, com fotos e tom de sentimento.",
      icon: "Newspaper",
      baseSize: fixedSize(6, 5),
      category: "contexto",
      // Lista de notícias. Em w=8/12 as notícias ficam mais largas com
      // foto + título lado-a-lado (já é o pattern interno) — escala bem.
      growConstraints: { maxW: 12, growable: ["w"] },
    },
    component: NoticiasMercadoIsland,
  },
  {
    meta: {
      kind: "panorama_global",
      label: "Panorama global",
      description: "Fita rolante com tickers globais (índices, câmbio, commodities, cripto) e status da B3.",
      icon: "Globe",
      // 12×1 (88px) — header compacto + tape cabem em uma linha. 12×2 deixava
      // ~100px de espaço vazio embaixo, desproporcional ao conteúdo.
      baseSize: fixedSize(12, 1),
      category: "contexto",
    },
    component: PanoramaGlobalIsland,
  },
  {
    meta: {
      kind: "resumo_indices",
      label: "Cenário externo",
      description: "Mercados financeiros fora do Brasil — S&P 500, Nasdaq, Dow, USD/BRL, VIX, DXY — com sparklines.",
      icon: "Globe",
      baseSize: fixedSize(6, 3),
      category: "contexto",
      // Grid 3×2 de mini-cards. Em w=8/12, os cards ficam mais largos —
      // o sparkline interno acompanha bem (já é 56×20 fixo, escala
      // proporcionalmente menos). Útil pra fechar rows onde fica alone.
      growConstraints: { maxW: 12, growable: ["w"] },
    },
    component: ResumoIndicesIsland,
  },
  {
    meta: {
      kind: "macro_global",
      label: "Commodities e cripto",
      description: "Brent, WTI, Ouro, Minério e Bitcoin — preços que mexem com Petrobras, Vale e apetite por risco.",
      icon: "Globe",
      // 12×2 (196px) — 5 cards numa linha horizontal, mesma topografia do
      // /mercado. 6×3 deixaria 1 célula vazia (são 5 ativos fixos no DTO).
      baseSize: fixedSize(12, 2),
      category: "contexto",
    },
    component: MacroGlobalIsland,
  },
  {
    meta: {
      kind: "macro_brasil",
      label: "Macro Brasil",
      description: "Selic, IPCA e IBC-Br — o tripé macroeconômico do Brasil com sparkline de 24 meses.",
      icon: "Globe",
      baseSize: fixedSize(6, 3),
      category: "contexto",
      // Layout list-row de 3 indicadores. Em w=8 o sparkline ganha mais
      // espaço; em w=12 vira full-width sem distorção.
      growConstraints: { maxW: 12, growable: ["w"] },
    },
    component: MacroBrasilIsland,
  },
  {
    meta: {
      kind: "atalho_watchlist",
      label: "Atalho da watchlist",
      description: "Tile compacto que abre a watchlist completa com 1 click.",
      icon: "Wallet",
      baseSize: fixedSize(4, 1),
      category: "core",
      // Filler ideal pra gaps de 4 cols. Cresce até 6 em row com 6+ gap.
      // h=2 alinha com vizinhos 4×2 quando packing vertical roda.
      growConstraints: { maxW: 6, maxH: 2, growable: ["w", "h"] },
    },
    component: AtalhoWatchlistIsland,
  },
  {
    meta: {
      kind: "heatmap_setorial",
      label: "Heatmap setorial",
      description: "Variação média por setor B3 colorida — vê fluxo setorial do dia de relance.",
      icon: "BarChart3",
      // 6×3 cabe ~6 setores em grid 3×2 (auto-fill min 140px).
      // Esticada pra 12×3 acomoda os 11 setores B3 sem scroll.
      // h=4 dá mais espaço quando estica vertical (mais info por célula).
      baseSize: fixedSize(6, 3),
      category: "contexto",
      growConstraints: { maxW: 12, maxH: 4, growable: ["w", "h"] },
    },
    component: HeatmapSetorialIsland,
  },
  {
    meta: {
      kind: "volatilidade",
      label: "Volatilidade",
      description: "Score 0-100 com label (Baixa/Moderada/Alta) — ajusta postura de leitura do dia.",
      icon: "Activity",
      // 4×2 compacto: número grande + badge + meta line. Ideal filler
      // pra rows com gap de 4 cols. h=3 alinha com vizinhos 6×3.
      baseSize: fixedSize(4, 2),
      category: "contexto",
      growConstraints: { maxW: 6, maxH: 3, growable: ["w", "h"] },
    },
    component: VolatilidadeIsland,
  },
  {
    meta: {
      kind: "mood_mercado",
      label: "Tom do mercado",
      description: "Pill BULLISH/NEUTRAL/BEARISH com 1 highlight do dia. Sinal-chave em 1 linha.",
      icon: "Gauge",
      // 4×1 ultra compacta — pill horizontal + texto. Filler ideal.
      baseSize: fixedSize(4, 1),
      category: "contexto",
      growConstraints: { maxW: 6, maxH: 2, growable: ["w", "h"] },
    },
    component: MoodMercadoIsland,
  },
  {
    meta: {
      kind: "fear_greed",
      label: "Fear & Greed",
      description: "Score CNN de sentimento USA (0-100). Complementa volatilidade — preço × sentiment.",
      icon: "Gauge",
      baseSize: fixedSize(4, 2),
      category: "contexto",
      growConstraints: { maxW: 6, maxH: 3, growable: ["w", "h"] },
    },
    component: FearGreedIsland,
  },
  {
    meta: {
      kind: "breadth_mercado",
      label: "Breadth",
      description: "% de empresas em alta vs baixa hoje. Detecta rali saudável vs concentrado.",
      icon: "Scale",
      baseSize: fixedSize(4, 2),
      category: "contexto",
      growConstraints: { maxW: 6, maxH: 3, growable: ["w", "h"] },
    },
    component: BreadthMercadoIsland,
  },
  {
    meta: {
      kind: "vix_dxy",
      label: "VIX & DXY",
      description: "Volatilidade implícita S&P 500 + índice do dólar. Drivers de fluxo estrangeiro.",
      icon: "Activity",
      // 4×2: 2 mini-cards lado-a-lado (VIX | DXY). Compacto pra row de 4+4+4.
      baseSize: fixedSize(4, 2),
      category: "contexto",
      growConstraints: { maxW: 8, maxH: 3, growable: ["w", "h"] },
    },
    component: VixDxyIsland,
  },
  {
    meta: {
      kind: "curva_di",
      label: "Curva DI",
      description: "ETTJ Anbima — pricing dos juros futuros por vencimento (Inclinada/Achatada/Invertida).",
      icon: "LineChart",
      // 6×3: chip + mini-chart + tenor labels + nota. Cabe confortável.
      baseSize: fixedSize(6, 3),
      category: "contexto",
      growConstraints: { maxW: 12, maxH: 4, growable: ["w", "h"] },
    },
    component: CurvaDiIsland,
  },
  {
    meta: {
      kind: "comparacoes_macro",
      label: "Comparações",
      description: "Cruzamentos clássicos: IBOV em USD, IBOV vs S&P, ouro/petróleo. Detecta rotação.",
      icon: "GitCompare",
      baseSize: fixedSize(6, 3),
      category: "contexto",
      growConstraints: { maxW: 12, growable: ["w"] },
    },
    component: ComparacoesMacroIsland,
  },
  {
    meta: {
      kind: "alfa_setorial",
      label: "Alfa setorial",
      description: "Ações que destoaram do próprio setor — sinaliza tese idiossincrática (não maré).",
      icon: "TrendingUp",
      baseSize: fixedSize(6, 3),
      category: "contexto",
      growConstraints: { maxW: 12, maxH: 4, growable: ["w", "h"] },
    },
    component: AlfaSetorialIsland,
  },
  {
    meta: {
      kind: "ex_dividendos",
      label: "Ex-dividendos",
      description: "Calendário de ações que passam a negociar sem direito ao próximo provento.",
      icon: "Calendar",
      baseSize: fixedSize(6, 3),
      category: "contexto",
      growConstraints: { maxW: 12, maxH: 4, growable: ["w", "h"] },
    },
    component: ExDividendosIsland,
  },
  // Layout primitive — não vai no catálogo "Adicionar ilha" (filtramos
  // por categoria), só é adicionada via "+ Nova seção" da navbar.
  {
    meta: {
      kind: "section_header",
      label: "Seção",
      description: "Divisor com título editável pra agrupar ilhas.",
      icon: "Heading2",
      baseSize: fixedSize(12, 1),
      category: "core",
    },
    component: SectionHeaderIsland,
  },
];

export const islandRegistry: Map<IslandKind, IslandRegistryEntry> = new Map(
  ENTRIES.map((entry) => [entry.meta.kind as IslandKind, entry]),
);

/** Recupera uma entrada do registro pelo `kind`. */
export function getIsland(kind: IslandKind): IslandRegistryEntry | undefined {
  return islandRegistry.get(kind);
}

/** Lista todas as ilhas atualmente registradas. */
export function listIslands(): IslandRegistryEntry[] {
  return Array.from(islandRegistry.values());
}

/** Tamanho efetivo de uma ilha — respeita `computeSize` se houver. */
export function resolveIslandSize(
  entry: IslandRegistryEntry,
  config: IslandConfig,
): IslandSize {
  if (entry.meta.computeSize) return entry.meta.computeSize(config);
  return entry.meta.baseSize;
}
