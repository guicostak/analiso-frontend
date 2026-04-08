/**
 * IslandRegistry
 *
 * Registro central das 17 ilhas disponíveis no `DashboardCanvas`. Cada
 * entrada associa um `IslandKind` a:
 *   - o componente React que renderiza a ilha
 *   - os metadados estáticos (`IslandMeta`) — label, descrição, ícone,
 *     categoria, baseSize no grid de 12 colunas e configSchema.
 */

import type {
  IslandComponent,
  IslandConfig,
  IslandMeta,
  IslandSize,
} from "../interfaces/island.types";
import type { IslandKind } from "../interfaces/layout.types";

import { ResumoDoDiaIsland }       from "../components/islands/ResumoDoDiaIsland";
import { PrioridadeDoDiaIsland }   from "../components/islands/PrioridadeDoDiaIsland";
import { MaiorAtencaoIsland }      from "../components/islands/MaiorAtencaoIsland";
import { MaiorMelhoraIsland }      from "../components/islands/MaiorMelhoraIsland";
import { WatchlistResumoIsland }   from "../components/islands/WatchlistResumoIsland";
import { FeedMudancasIsland }      from "../components/islands/FeedMudancasIsland";
import { ContinueIsland }          from "../components/islands/ContinueIsland";
import { EmpresasRecentesIsland }  from "../components/islands/EmpresasRecentesIsland";
import { BuscasRecentesIsland }    from "../components/islands/BuscasRecentesIsland";
import { ComparacoesRecentesIsland } from "../components/islands/ComparacoesRecentesIsland";
import { AgendaIsland }            from "../components/islands/AgendaIsland";
import { AlertasRecentesIsland }   from "../components/islands/AlertasRecentesIsland";
import { SinaisWatchlistIsland }   from "../components/islands/SinaisWatchlistIsland";
import { CicloMercadoIsland }      from "../components/islands/CicloMercadoIsland";
import { HeatmapPilarIsland }      from "../components/islands/HeatmapPilarIsland";
import { QualidadeDadosIsland }    from "../components/islands/QualidadeDadosIsland";
import { EditorialDoDiaIsland }    from "../components/islands/EditorialDoDiaIsland";

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

// ─── Registro das 17 ilhas ───────────────────────────────────────────────────

const ENTRIES: IslandRegistryEntry[] = [
  {
    meta: {
      kind: "resumo_dia",
      label: "Resumo do dia",
      description: "Headline e contexto geral do dia (Anchoring + Primacy).",
      icon: "Sun",
      baseSize: fixedSize(12, 2),
      category: "core",
    },
    component: ResumoDoDiaIsland,
  },
  {
    meta: {
      kind: "prioridade_dia",
      label: "Prioridade do dia",
      description: "Item-âncora com CTA pré-selecionado (Default Effect).",
      icon: "Target",
      baseSize: fixedSize(4, 2),
      category: "core",
    },
    component: PrioridadeDoDiaIsland,
  },
  {
    meta: {
      kind: "maior_atencao",
      label: "Maior atenção",
      description: "Item de maior risco entrando na watchlist (Loss Aversion).",
      icon: "AlertTriangle",
      baseSize: fixedSize(4, 2),
      category: "core",
    },
    component: MaiorAtencaoIsland,
  },
  {
    meta: {
      kind: "maior_melhora",
      label: "Maior melhora",
      description: "Recuperação mais relevante da watchlist hoje.",
      icon: "TrendingUp",
      baseSize: fixedSize(4, 2),
      category: "core",
    },
    component: MaiorMelhoraIsland,
  },
  {
    meta: {
      kind: "watchlist_resumo",
      label: "Saúde da watchlist",
      description: "Quantos seguem estáveis vs em pressão.",
      icon: "Heart",
      baseSize: fixedSize(4, 3),
      category: "core",
    },
    component: WatchlistResumoIsland,
  },
  {
    meta: {
      kind: "feed_mudancas",
      label: "Mudanças que importam",
      description: "Feed curado com impacto, fonte e data.",
      icon: "Activity",
      baseSize: fixedSize(8, 3),
      category: "core",
    },
    component: FeedMudancasIsland,
  },
  {
    meta: {
      kind: "continue",
      label: "Continuar de onde parei",
      description: "Retoma a última leitura interrompida (Zeigarnik).",
      icon: "PlayCircle",
      baseSize: fixedSize(4, 1),
      category: "acumulo",
    },
    component: ContinueIsland,
  },
  {
    meta: {
      kind: "empresas_recentes",
      label: "Empresas recentes",
      description: "Últimas empresas visitadas (Sunk Cost + IKEA Effect).",
      icon: "Building2",
      baseSize: fixedSize(4, 2),
      category: "acumulo",
    },
    component: EmpresasRecentesIsland,
  },
  {
    meta: {
      kind: "buscas_recentes",
      label: "Buscas recentes",
      description: "Últimos termos de busca usados.",
      icon: "Search",
      baseSize: fixedSize(4, 2),
      category: "acumulo",
    },
    component: BuscasRecentesIsland,
  },
  {
    meta: {
      kind: "comparacoes_recentes",
      label: "Comparações recentes",
      description: "Últimas comparações entre empresas.",
      icon: "GitCompare",
      baseSize: fixedSize(4, 2),
      category: "acumulo",
    },
    component: ComparacoesRecentesIsland,
  },
  {
    meta: {
      kind: "agenda",
      label: "Agenda",
      description: "Próximos eventos relevantes da watchlist.",
      icon: "Calendar",
      baseSize: fixedSize(4, 2),
      category: "contexto",
    },
    component: AgendaIsland,
  },
  {
    meta: {
      kind: "alertas_recentes",
      label: "Alertas",
      description: "Alertas disparados nos últimos dias.",
      icon: "Bell",
      baseSize: fixedSize(3, 1),
      category: "contexto",
    },
    component: AlertasRecentesIsland,
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
    },
    component: SinaisWatchlistIsland,
  },
  {
    meta: {
      kind: "ciclo_mercado",
      label: "Ciclo de mercado",
      description: "Onde estamos no ciclo macro.",
      icon: "Compass",
      baseSize: fixedSize(3, 1),
      category: "contexto",
      requiresPlan: "premium",
    },
    component: CicloMercadoIsland,
  },
  {
    meta: {
      kind: "heatmap_pilar",
      label: "Heatmap por pilar",
      description: "Distribuição de mudanças por pilar.",
      icon: "Grid3x3",
      baseSize: fixedSize(6, 2),
      category: "contexto",
    },
    component: HeatmapPilarIsland,
  },
  {
    meta: {
      kind: "qualidade_dados",
      label: "Qualidade dos dados",
      description: "Alertas sobre frescor e cobertura dos dados.",
      icon: "Database",
      baseSize: fixedSize(3, 1),
      category: "contexto",
    },
    component: QualidadeDadosIsland,
  },
  {
    meta: {
      kind: "editorial_dia",
      label: "Editorial do dia",
      description: "Sugestão editorial: por onde começar.",
      icon: "Newspaper",
      baseSize: fixedSize(12, 1),
      category: "core",
    },
    component: EditorialDoDiaIsland,
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
