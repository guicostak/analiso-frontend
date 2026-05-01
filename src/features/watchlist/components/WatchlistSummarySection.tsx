"use client";

/**
 * WatchlistSummarySection
 *
 * Faixa de resumo agregado renderizada acima da lista de ações.
 *
 * Consome `/api/me/watchlist/summary` e mostra:
 *  1. KPI strip com médias/medianas fundamentalistas (Qualidade, P/L, P/VP, DY, ROE)
 *     + contador de empresas em risco.
 *  2. Alocação por setor (donut do Tremor).
 *  3. Distribuição de fraqueza dominante por dimensão do snowflake (barras).
 *
 * Observações:
 *  - Tolerante a nulls: uma watchlist com poucas empresas com dados mostra "—".
 *  - Silencia-se quando a watchlist está vazia.
 *  - Usa o mesmo padrão visual de KPI strip do `AnalysisShared.SectionCard`
 *    (barra colorida vertical + label em caixa alta).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { LineChart } from "@tremor/react";
import { Info, Radar } from "lucide-react";

import { useAuth } from "@/src/features/auth/AuthContext";
import { normalizeApiError } from "@/src/lib/errors";
import { SnowflakeChart } from "@/src/components/shared/SnowflakeChart";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import { getSectorCatalog, getWatchlistPerformance, getWatchlistSummary } from "../services";
import type {
  SectorCatalogItem,
  WatchlistPerformance,
  WatchlistPerformancePoint,
  WatchlistPerformanceRange,
  WatchlistSummary,
  WatchlistSummarySlimItem,
} from "../interfaces";

// ─── Formatters ───────────────────────────────────────────────────────────────

/** "—" quando nulo, senão o número formatado PT-BR com 1 casa. */
function fmt(n: number | null | undefined, suffix = "", decimals = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(decimals).replace(".", ",")}${suffix}`;
}

function fmtMultiple(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1).replace(".", ",")}x`;
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1).replace(".", ",")}%`;
}

// ─── Reusable bits ────────────────────────────────────────────────────────────

/** Ícone que identifica que a ilha pertence à seção "Watchlist" — mesmo
 *  ícone usado no sidebar. Quando as ilhas forem reaproveitadas no dashboard,
 *  esse marcador deixa claro de qual seção vieram. */
function WatchlistMark({ className = "h-4 w-4" }: { className?: string }) {
  return <Radar className={`${className} text-brand`} aria-hidden strokeWidth={2.25} />;
}

/** Ícone "i" com tooltip funcional. Antes era decorativo. */
function InfoHint({ text, label = "Mais informações" }: { text: string; label?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Info className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="end" sideOffset={6} className="max-w-[280px] whitespace-normal text-left leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface Kpi {
  label: string;
  value: string;
  sub?: string;
  color: string;
  primary?: boolean;
}

function KpiItem({ kpi }: { kpi: Kpi }) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-[3px] self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: kpi.color }}
      />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {kpi.label}
        </p>
        <p
          className={`mt-1 text-[18px] font-semibold leading-none text-foreground ${
            kpi.primary ? "tracking-tight" : ""
          }`}
        >
          {kpi.value}
        </p>
        {kpi.sub && (
          <p className="mt-1 text-[11px] text-muted-foreground leading-4">{kpi.sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WatchlistSummarySection({
  hasFavorites,
  watchlistTickers,
}: {
  hasFavorites: boolean;
  /** Set dos tickers favoritados. Usado para disparar refetch quando o
   *  usuário adiciona/remove empresas pelo modal. */
  watchlistTickers: Set<string>;
}) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<WatchlistSummary | null>(null);
  const [sectorCatalog, setSectorCatalog] = useState<SectorCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assinatura estável: ticker set → string canônica. Muda toda vez que o
  // conjunto muda (add/remove), dispara o useEffect abaixo para rebuscar o
  // summary. Evita ter um Set como dep (referência muda a cada render).
  const tickersSignature = useMemo(
    () => Array.from(watchlistTickers).sort().join(","),
    [watchlistTickers],
  );

  useEffect(() => {
    if (!token || !hasFavorites) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Busca summary e catálogo em paralelo. Catálogo é público e estável (1h
    // de cache no backend), então uma falha aqui não invalida o summary.
    Promise.all([
      getWatchlistSummary(token),
      getSectorCatalog().catch((e) => {
        console.warn("[watchlist/sector-catalog] indisponível:", e);
        return [] as SectorCatalogItem[];
      }),
    ])
      .then(([summaryData, catalogData]) => {
        setSummary(summaryData);
        setSectorCatalog(catalogData);
        setError(null);
      })
      .catch((err) => {
        console.error("[watchlist/summary] erro ao buscar resumo:", err);
        const { message } = normalizeApiError(err);
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [token, hasFavorites, tickersSignature]);

  if (!hasFavorites) return null;

  if (loading) {
    return <SummarySkeleton />;
  }

  if (error || !summary || summary.totalCompanies === 0) {
    return null;
  }

  const { kpis, sectorAllocation, snowflakeAggregate, items, totalCompanies, withoutData } = summary;

  const kpiList: Kpi[] = [
    {
      label: "Qualidade média",
      value: kpis.qualityAverage != null ? Math.round(kpis.qualityAverage).toString() : "—",
      sub: "média das 5 dimensões",
      color: "var(--brand, #12A594)",
      primary: true,
    },
    {
      label: "P/L médio",
      value: fmtMultiple(kpis.peAverage),
      // Sub mostra quantas empresas com lucro entraram no cálculo. Empresas
      // com P/L negativo (prejuízo) ficam fora pra não enviesar a média.
      sub:
        kpis.peValidCount === 0
          ? "sem empresas com lucro"
          : `${kpis.peValidCount} ${kpis.peValidCount === 1 ? "empresa" : "empresas"}`,
      color: "#0EA5E9",
    },
    {
      label: "P/VP médio",
      value: fmtMultiple(kpis.pbAverage),
      sub:
        kpis.pbValidCount === 0
          ? "sem dados"
          : `${kpis.pbValidCount} ${kpis.pbValidCount === 1 ? "empresa" : "empresas"}`,
      color: "#6366F1",
    },
    {
      label: "DY médio",
      value: fmtPct(kpis.dyAverage),
      // Empresas com DY=0 (não pagaram) ficam fora — incluir zeros distorce
      // (ex: 2 pagadoras a 7,5% e 5,2% + 10 não-pagadoras = "média 1,1%").
      sub:
        kpis.dividendPayerCount === 0
          ? "nenhuma pagadora"
          : `${kpis.dividendPayerCount} ${kpis.dividendPayerCount === 1 ? "pagadora" : "pagadoras"}`,
      color: "#10B981",
    },
    {
      label: "ROE médio",
      value: fmtPct(kpis.roeAverage),
      sub: kpis.netMarginAverage != null ? `margem líquida ${fmtPct(kpis.netMarginAverage)}` : undefined,
      color: "#8B5CF6",
    },
  ];


  return (
    <section className="space-y-3">
      {/* Resumo da watchlist — agora uma ilha unificada (header + KPI strip
          dentro do mesmo card), seguindo o padrão das outras ilhas. */}
      <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <WatchlistMark className="h-4 w-4" />
            <h3 className="text-[13px] font-semibold text-foreground">Resumo da watchlist</h3>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {totalCompanies} {totalCompanies === 1 ? "empresa" : "empresas"}
            {withoutData > 0 && (
              <>
                {" · "}
                <span className="text-warning-text">
                  {withoutData} sem dados
                </span>
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpiList.map((kpi) => (
            <KpiItem key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </div>

      {/* Sector + pillar */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Setor */}
        <SectorAllocationCard
          sectorAllocation={sectorAllocation}
          catalog={sectorCatalog}
        />

        {/* Dimensões em destaque (forças + a observar) */}
        <DimensionsHighlightCard
          aggregate={snowflakeAggregate}
          items={items}
        />
      </div>

      {/* Performance vs IBOV + Snowflake agregada (lado a lado) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <PerformanceCard />
        <SnowflakeAggregateCard
          aggregate={snowflakeAggregate}
          qualityAverage={kpis.qualityAverage}
          totalWithData={totalCompanies - withoutData}
        />
      </div>

      {fmt(summary.freshnessPercent) !== "—" && summary.freshnessPercent < 100 && (
        <p className="text-[11px] text-muted-foreground">
          Dados atualizados em {fmt(summary.freshnessPercent, "%", 0)} das empresas da lista.
        </p>
      )}
    </section>
  );
}

// ─── Sub-cards ────────────────────────────────────────────────────────────────

/** Card "Alocação por setor"
 *
 *  Foco: mostrar a alocação real da watchlist via donut + lista compacta.
 *  Embaixo, em uma faixa separada, lista os nomes dos setores que existem
 *  na base mas ainda não estão cobertos — referência pura, sem números de
 *  empresas (irrelevante pro usuário). Tags textuais discretas em cinza.
 */
function SectorAllocationCard({
  sectorAllocation,
  catalog,
}: {
  sectorAllocation: WatchlistSummary["sectorAllocation"];
  catalog: SectorCatalogItem[];
}) {
  // Lista TODOS os setores conhecidos: os do catálogo + os que estão na
  // watchlist mas faltam no catálogo (raro, mas defensivo). Cor de cada setor
  // vem de `colorForSector(name)` — função pura por nome, garante que o
  // donut e o chip mostrem a mesma cor pro mesmo setor sem propagar prop.
  const allSectorChips = useMemo(() => {
    const seen = new Set<string>();
    const covered: { sector: string; isMine: true }[] = [];
    const others:  { sector: string; isMine: false }[] = [];

    // Primeiro os cobertos, na ordem em que aparecem em sectorAllocation.
    for (const s of sectorAllocation) {
      const key = s.sector.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        covered.push({ sector: s.sector, isMine: true });
      }
    }

    // Depois os do catálogo que ainda não vimos.
    for (const c of catalog) {
      const key = c.sector.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        others.push({ sector: c.sector, isMine: false });
      }
    }

    others.sort((a, b) => a.sector.localeCompare(b.sector, "pt-BR"));
    return [...covered, ...others];
  }, [sectorAllocation, catalog]);

  // Slices do donut com cor derivada do nome — mesma fonte de cor das chips.
  const donutSlices = sectorAllocation.map((b) => ({
    label: b.sector,
    value: b.count,
    color: colorForSector(b.sector),
  }));

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <WatchlistMark className="h-4 w-4" />
          <h3 className="text-[13px] font-semibold text-foreground">Alocação por setor</h3>
        </div>
        <InfoHint text="Distribuição dos setores presentes na sua watchlist (peso igual entre ativos). A faixa abaixo do gráfico lista outros setores existentes na plataforma como referência ao montar a lista." />
      </div>

      {sectorAllocation.length === 0 ? (
        <EmptyHint text="Sem setores classificados." />
      ) : (
        <>
          {/* Donut + legenda */}
          <div className="flex items-center gap-5">
            <div className="relative h-32 w-32 flex-shrink-0">
              <SectorDonut slices={donutSlices} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground">Setores</div>
                  <div className="text-sm font-bold text-foreground">{sectorAllocation.length}</div>
                </div>
              </div>
            </div>

            <ul className="flex-1 space-y-2 text-[12.5px]">
              {sectorAllocation.map((b) => (
                <li key={b.sector} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: colorForSector(b.sector) }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground" title={b.sector}>
                    {b.sector}
                  </span>
                  <span className="flex-shrink-0 tabular-nums text-muted-foreground">
                    {b.percent.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Faixa de referência: TODOS os setores na plataforma. */}
          {allSectorChips.length > 0 && (
            <div className="mt-5 border-t border-border/60 pt-4">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Setores na plataforma
                </p>
                <p className="text-[10px] text-muted-foreground">
                  ● na sua watchlist · ○ não cobertos
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allSectorChips.map((s) => (
                  <SectorChip
                    key={s.sector}
                    sector={s.sector}
                    tone={s.isMine ? "mine" : "other"}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Donut SVG simples e independente do tema/Tailwind.
 *
 *  Usamos SVG nativo em vez do `DonutChart` do Tremor porque a paleta nominal
 *  do Tremor (ex: "sky", "blue") depende de classes Tailwind geradas
 *  dinamicamente — incompatível com o setup Tailwind v4 deste projeto, o que
 *  fazia a 2ª fatia em diante renderizar preto. Aqui as cores vêm como hex
 *  já resolvido, então renderiza igual em light/dark mode. */
function SectorDonut({
  slices,
  size = 128,
  strokeWidth = 22,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const total = slices.reduce((acc, s) => acc + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Caso degenerado: 0 ou nenhum slice → trilha cinza simples
  if (total <= 0 || slices.length === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  let offset = 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      role="img"
      aria-label={`Donut: ${slices.map((s) => `${s.label} ${((s.value / total) * 100).toFixed(0)}%`).join(", ")}`}
    >
      {/* Track de fundo — visível como gap quando há só 1 slice ou totais 0 */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.06}
        strokeWidth={strokeWidth}
      />
      {slices.map((s) => {
        const fraction = s.value / total;
        const length = fraction * circumference;
        // strokeDasharray = "comprimento do arco" + "resto da circunferência"
        // strokeDashoffset = quantidade já desenhada antes deste slice
        const dasharray = `${length} ${circumference - length}`;
        const dashoffset = -offset;
        offset += length;
        return (
          <circle
            key={s.label}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            strokeLinecap="butt"
          >
            <title>{`${s.label}: ${((fraction) * 100).toFixed(0)}%`}</title>
          </circle>
        );
      })}
    </svg>
  );
}

/**
 * Line chart SVG custom para 2 séries (watchlist + IBOV) já normalizadas a 100.
 *
 * Usamos SVG direto em vez do `LineChart` do Tremor pelo mesmo motivo do
 * `SectorDonut`: cores nominais do Tremor ("gray", "sky"...) dependem de
 * classes Tailwind que não estão sendo extraídas no build (Tailwind v4 +
 * Tremor v3) e a 2ª linha vinha invisível. Aqui passamos hex direto.
 *
 * Inclui:
 *  - Linha de referência horizontal em 100 (tracejada, "ponto base")
 *  - 2 linhas suavizadas (Catmull-Rom) com cores controladas
 *  - Eixo Y compacto (3 ticks: min, base 100, max)
 *  - Tooltip nativo SVG (`<title>`) em cada linha
 */
function DualLineChart({
  series,
  watchlistColor,
  ibovColor,
  height = 150,
}: {
  series: WatchlistPerformancePoint[];
  watchlistColor: string;
  ibovColor: string;
  height?: number;
}) {
  // Largura real do container — medida via ResizeObserver. Necessário porque
  // com `preserveAspectRatio="none"` o texto fica esticado, e com viewBox
  // fixo vs container variável os elementos ficam comprimidos. Mantemos a
  // proporção desenhando com a largura efetiva.
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0) setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(containerWidth, 240); // floor pra não estourar layouts mínimos
  const H = height;
  const PAD_T = 10;
  const PAD_B = 10;
  const PAD_L = 32;   // espaço pros labels do eixo Y
  const PAD_R = 10;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  // Filtra pontos com ambas as séries válidas pra evitar gaps.
  const pts = series.filter(
    (p) => p.watchlist != null && p.ibov != null && Number.isFinite(p.watchlist) && Number.isFinite(p.ibov),
  );

  if (pts.length < 2) {
    return (
      <div className="flex h-[var(--h)] items-center justify-center rounded-md border border-dashed border-border text-[11px] text-muted-foreground"
           style={{ ["--h" as string]: `${H}px` }}>
        Sem pontos suficientes para o gráfico.
      </div>
    );
  }

  // Domínio Y: pega min/max das duas séries + margem de 2pp.
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const p of pts) {
    if (p.watchlist! < yMin) yMin = p.watchlist!;
    if (p.watchlist! > yMax) yMax = p.watchlist!;
    if (p.ibov! < yMin) yMin = p.ibov!;
    if (p.ibov! > yMax) yMax = p.ibov!;
  }
  // Garante que 100 (base) sempre apareça no eixo
  yMin = Math.min(yMin, 100);
  yMax = Math.max(yMax, 100);
  const margin = (yMax - yMin) * 0.08 || 1;
  yMin -= margin;
  yMax += margin;

  const x = (i: number) => PAD_L + (i / (pts.length - 1)) * innerW;
  const y = (v: number) => PAD_T + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  // Path Catmull-Rom suavizado (mais agradável visualmente que linha reta).
  function smoothPath(values: number[]): string {
    const n = values.length;
    if (n === 0) return "";
    const parts = [`M ${x(0).toFixed(2)},${y(values[0]).toFixed(2)}`];
    for (let i = 0; i < n - 1; i++) {
      const p0 = values[Math.max(0, i - 1)];
      const p1 = values[i];
      const p2 = values[i + 1];
      const p3 = values[Math.min(n - 1, i + 2)];
      const cp1x = x(i) + (x(i + 1) - x(Math.max(0, i - 1))) / 6;
      const cp1y = y(p1) + (y(p2) - y(p0)) / 6;
      const cp2x = x(i + 1) - (x(Math.min(n - 1, i + 2)) - x(i)) / 6;
      const cp2y = y(p2) - (y(p3) - y(p1)) / 6;
      parts.push(`C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${x(i + 1).toFixed(2)},${y(p2).toFixed(2)}`);
    }
    return parts.join(" ");
  }

  const watchlistPath = smoothPath(pts.map((p) => p.watchlist!));
  const ibovPath = smoothPath(pts.map((p) => p.ibov!));

  // 3 ticks Y: min arredondado, 100 (base), max arredondado.
  const ticks = [yMin, 100, yMax].map((v) => ({ value: v, y: y(v) }));

  // Última leitura — dot final pra dar âncora visual
  const lastIdx = pts.length - 1;
  const lastWatchlist = pts[lastIdx].watchlist!;
  const lastIbov = pts[lastIdx].ibov!;

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Performance da watchlist vs IBOV"
        style={{ display: "block" }}
      >
        {/* Linha de referência em 100 (base) */}
        <line
          x1={PAD_L} y1={y(100)} x2={W - PAD_R} y2={y(100)}
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Eixo Y — labels textuais */}
        {ticks.map((t, i) => (
          <text
            key={i}
            x={PAD_L - 4}
            y={t.y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="9"
            fill="currentColor"
            fillOpacity={0.5}
          >
            {t.value === 100 ? "100" : t.value.toFixed(0)}
          </text>
        ))}

        {/* Linha do IBOV (tracejada, atrás) */}
        <path
          d={ibovPath}
          fill="none"
          stroke={ibovColor}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 3"
          opacity={0.85}
        >
          <title>{`IBOV ${pts[0].date} → ${pts[lastIdx].date}: ${(lastIbov - 100).toFixed(1)}%`}</title>
        </path>

        {/* Linha da Watchlist (sólida, na frente) */}
        <path
          d={watchlistPath}
          fill="none"
          stroke={watchlistColor}
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>{`Watchlist ${pts[0].date} → ${pts[lastIdx].date}: ${(lastWatchlist - 100).toFixed(1)}%`}</title>
        </path>

        {/* Dot final — Watchlist */}
        <circle
          cx={x(lastIdx)} cy={y(lastWatchlist)}
          r={3.5}
          fill={watchlistColor}
          stroke="var(--background, #fff)"
          strokeWidth={1.5}
        />

        {/* Dot final — IBOV */}
        <circle
          cx={x(lastIdx)} cy={y(lastIbov)}
          r={3}
          fill={ibovColor}
          stroke="var(--background, #fff)"
          strokeWidth={1.5}
          opacity={0.85}
        />
      </svg>
    </div>
  );
}

/** Chip de setor.
 *
 *  Cada setor tem uma cor estável (derivada do nome via hash, ver
 *  {@link colorForSector}) — assim donut e chips sempre mostram a mesma
 *  cor pra um mesmo setor.
 *
 *  - `mine`: presente na watchlist. Background tonalizado da cor (~14%) +
 *     texto na cor cheia + dot sólido. Mais saturado, dá peso visual.
 *  - `other`: existe na base mas não está na watchlist. Mesma cor mas com
 *     saturação reduzida (background ~6%, texto cinza, borda ~30% da cor,
 *     dot outline). Diferencia "minha" vs "outras" por saturação, mantendo
 *     todas com cor (não cinza-puro). */
function SectorChip({
  sector,
  tone,
}: {
  sector: string;
  tone: "mine" | "other";
}) {
  const color = colorForSector(sector);

  if (tone === "mine") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold"
        style={{
          backgroundColor: `${color}24`,    // ~14% alpha — background visível
          color,
        }}
        title={sector}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        {sector}
      </span>
    );
  }

  // tone === "other"
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] text-foreground/75"
      style={{
        backgroundColor: `${color}10`,    // ~6% alpha — sutil mas não invisível
        borderColor: `${color}4D`,        // ~30% alpha — define o chip
      }}
      title={sector}
    >
      <span
        className="h-1.5 w-1.5 rounded-full border bg-transparent"
        style={{ borderColor: color }}
        aria-hidden
      />
      {sector}
    </span>
  );
}

/** Paleta consistente — usada tanto no donut quanto nos chips. */
const SECTOR_PALETTE = [
  "#14B8A6", // teal
  "#0EA5E9", // sky
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#F43F5E", // rose
  "#6366F1", // indigo
  "#10B981", // emerald
  "#D946EF", // fuchsia
  "#F97316", // orange
] as const;

/** Cor estável por nome de setor — mesmo nome → sempre a mesma cor (hash
 *  determinístico). Garante que o donut e os chips mostrem cores idênticas
 *  para o mesmo setor sem precisar passar prop entre componentes. */
function colorForSector(sector: string): string {
  const name = (sector ?? "").toLowerCase().trim();
  if (!name) return SECTOR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    // FNV-like simples — espalha bem em palavras curtas em pt-BR.
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return SECTOR_PALETTE[Math.abs(hash) % SECTOR_PALETTE.length];
}

/**
 * Card "Dimensões em destaque" — substitui o antigo "Fraqueza dominante".
 *
 * Comparado ao card antigo (que só mostrava fraquezas e contava empresas):
 *   - Mostra forças E pontos a observar (visão equilibrada)
 *   - Usa o score médio absoluto (0–100) em vez de % relativo entre empresas,
 *     que ficava confuso em watchlists pequenas
 *   - Lista os tickers que mais puxam cada extremo (com seus scores), pra
 *     dar concretude
 *   - Top 2 dimensões em cada grupo (a do meio fica fora, sem opinião)
 */
function DimensionsHighlightCard({
  aggregate,
  items,
}: {
  aggregate: WatchlistSummary["snowflakeAggregate"];
  items: WatchlistSummarySlimItem[];
}) {
  type DimKey = "value" | "future" | "past" | "health" | "dividend";
  const DIMS: { key: DimKey; label: string; hint: string }[] = [
    { key: "value",    label: "Valor",      hint: "Preço atual vs valor justo (DCF, múltiplos)" },
    { key: "future",   label: "Futuro",     hint: "Crescimento esperado de receita e lucro" },
    { key: "past",     label: "Passado",    hint: "Performance histórica (ROE, margens)" },
    { key: "health",   label: "Saúde",      hint: "Solidez do balanço (dívida, liquidez)" },
    { key: "dividend", label: "Dividendos", hint: "Histórico e consistência de pagamento" },
  ];

  // Score médio agregado por dimensão. Filtra dimensões sem dado pra evitar
  // ranquear "null" como ponto fraco.
  const ranked = useMemo(() => {
    return DIMS
      .map((d) => ({ ...d, score: aggregate[d.key] }))
      .filter((d): d is typeof d & { score: number } =>
        d.score != null && Number.isFinite(d.score),
      )
      .sort((a, b) => b.score - a.score);
  }, [aggregate]);

  // Top 2 = pontos fortes, bottom 2 = a observar. Em watchlists muito magras
  // (3 dimensões com dados) trabalhamos com o que houver — top 1 / bottom 1.
  const strengths = ranked.slice(0, 2);
  const weaknesses = ranked.slice(-2).reverse(); // do menor (mais fraco) ao penúltimo

  // Para cada dimensão, top 3 tickers ordenados pelo score individual nessa
  // dimensão. Direção depende do contexto: força → desc; observar → asc.
  function topTickers(key: DimKey, direction: "desc" | "asc"): { ticker: string; score: number }[] {
    const list = items
      .filter((i) => !i.missing && i.snowflake)
      .map((i) => ({ ticker: i.ticker, score: i.snowflake?.[key] }))
      .filter((t): t is { ticker: string; score: number } =>
        t.score != null && Number.isFinite(t.score),
      );
    list.sort((a, b) => (direction === "desc" ? b.score - a.score : a.score - b.score));
    return list.slice(0, 3);
  }

  if (ranked.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <WatchlistMark className="h-4 w-4" />
            <h3 className="text-[13px] font-semibold text-foreground">Dimensões em destaque</h3>
          </div>
          <InfoHint text="Ranqueia as 5 dimensões fundamentalistas (Valor, Futuro, Passado, Saúde, Dividendos) pelo score médio na sua watchlist. As 2 mais altas viram pontos fortes; as 2 mais baixas, pontos a observar." />
        </div>
        <EmptyHint text="Sem dados suficientes para ranquear dimensões." />
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <WatchlistMark className="h-4 w-4" />
          <h3 className="text-[13px] font-semibold text-foreground">Dimensões em destaque</h3>
        </div>
        <InfoHint text="Ranqueia as 5 dimensões fundamentalistas (Valor, Futuro, Passado, Saúde, Dividendos) pelo score médio na sua watchlist. As 2 mais altas viram pontos fortes; as 2 mais baixas, pontos a observar. Os tickers ao lado mostram quem mais puxa cada extremo." />
      </div>

      {/* Pontos fortes */}
      {strengths.length > 0 && (
        <div className="mb-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-success-text">
            <span className="text-[10px]">▲</span> Principais pontos
          </p>
          <ul className="space-y-3">
            {strengths.map((d) => (
              <DimensionHighlightRow
                key={`s-${d.key}`}
                label={d.label}
                hint={d.hint}
                score={d.score}
                tone="strength"
                tickers={topTickers(d.key, "desc")}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Pontos a observar */}
      {weaknesses.length > 0 && (
        <div className="border-t border-border/60 pt-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-warning-text">
            <span className="text-[10px]">▼</span> A observar
          </p>
          <ul className="space-y-3">
            {weaknesses.map((d) => (
              <DimensionHighlightRow
                key={`w-${d.key}`}
                label={d.label}
                hint={d.hint}
                score={d.score}
                tone="weakness"
                tickers={topTickers(d.key, "asc")}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Linha de uma dimensão dentro do `DimensionsHighlightCard`. */
function DimensionHighlightRow({
  label,
  hint,
  score,
  tone,
  tickers,
}: {
  label: string;
  hint: string;
  score: number;
  tone: "strength" | "weakness";
  tickers: { ticker: string; score: number }[];
}) {
  const barColor = tone === "strength" ? "var(--color-success-text, #2EAA8A)" : "var(--color-warning-text, #D4913B)";
  const widthPct = Math.max(4, Math.min(100, score));

  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-2 text-[12.5px]">
          <span className="font-semibold text-foreground">{label}</span>
          <span className="text-[10.5px] text-muted-foreground" title={hint}>
            {hint}
          </span>
        </span>
        <span className="flex-shrink-0 text-[12px] font-semibold tabular-nums text-foreground">
          {Math.round(score)}
          <span className="text-[10px] font-normal text-muted-foreground">/100</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${widthPct}%`, backgroundColor: barColor }}
        />
      </div>
      {tickers.length > 0 && (
        <ul className="flex flex-wrap items-center gap-1 pt-0.5 text-[10.5px]">
          {tickers.map((t, i) => (
            <li key={t.ticker} className="inline-flex items-center">
              <span className="font-mono font-semibold text-foreground">{t.ticker}</span>
              <span className="ml-1 tabular-nums text-muted-foreground">{Math.round(t.score)}</span>
              {i < tickers.length - 1 && (
                <span className="mx-1.5 text-muted-foreground/40">·</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Performance histórica da watchlist vs IBOV.
 *
 * Cálculo é feito server-side ({@code GET /api/me/watchlist/performance}) —
 * o cliente só consome a série já normalizada (base 100) + summary com
 * variação %, alpha vs IBOV e volatilidade anualizada.
 */
const PERFORMANCE_RANGES: { key: WatchlistPerformanceRange; label: string }[] = [
  { key: "30d",  label: "30d" },
  { key: "90d",  label: "90d" },
  { key: "180d", label: "180d" },
  { key: "1y",   label: "1A" },
  { key: "max",  label: "Máx" },
];

function PerformanceCard() {
  const { token } = useAuth();
  const [range, setRange] = useState<WatchlistPerformanceRange>("90d");
  const [data, setData] = useState<WatchlistPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    getWatchlistPerformance(range, token)
      .then((d) => { if (!cancelled) { setData(d); setError(null); } })
      .catch((err) => {
        console.error("[watchlist/performance]", err);
        if (!cancelled) {
          const { message } = normalizeApiError(err);
          setError(message);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, range]);

  const hasData = !!data && data.series.length >= 2;
  const summary = data?.summary;
  const watchlistChg = summary?.watchlistChangePct ?? null;
  const ibovChg = summary?.ibovChangePct ?? null;
  const alpha = summary?.alphaPp ?? null;
  const vol = summary?.watchlistVolatility ?? null;

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <WatchlistMark className="h-4 w-4" />
          <h3 className="text-[13px] font-semibold text-foreground">Performance da watchlist</h3>
        </div>
        <div className="flex items-center gap-2">
          <RangeSelector value={range} onChange={setRange} />
          <InfoHint text="Cada ação da watchlist começa em 100 na data base e mostramos como o índice médio (peso igual entre ações) evoluiu vs IBOV. Variação % é o quanto subiu/caiu desde a base. Alpha = sua watchlist menos o IBOV, em pontos percentuais. Volatilidade anualizada mede o quanto os retornos diários oscilaram." />
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-3">
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="h-32 w-full animate-pulse rounded bg-muted" />
        </div>
      ) : error && !data ? (
        <EmptyHint text={error} />
      ) : !hasData ? (
        <EmptyHint text="Histórico insuficiente para o intervalo selecionado." />
      ) : (
        <>
          {/* ── Stats em destaque ───────────────────────────────────────── */}
          <div className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Watchlist
              </p>
              <p className={`text-[22px] font-bold leading-none tracking-tight ${
                (watchlistChg ?? 0) >= 0 ? "text-success-text" : "text-danger-text"
              }`}>
                {fmtSignedPct(watchlistChg)}
              </p>
              <p className="mt-1 text-[10.5px] text-muted-foreground">
                {data?.baseDate && data?.asOf
                  ? `${formatBR(data.baseDate)} → ${formatBR(data.asOf)}`
                  : "—"}
              </p>
            </div>
            <div className="border-l border-border pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                IBOV
              </p>
              <p className="text-[18px] font-semibold leading-none text-foreground">
                {fmtSignedPct(ibovChg)}
              </p>
              <p className="mt-1 text-[10.5px] text-muted-foreground">no mesmo período</p>
            </div>
            <div className="border-l border-border pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Alpha
              </p>
              <p className={`text-[18px] font-semibold leading-none ${
                (alpha ?? 0) >= 0 ? "text-success-text" : "text-danger-text"
              }`}>
                {fmtSignedNumber(alpha, "pp")}
              </p>
              <p className="mt-1 text-[10.5px] text-muted-foreground">vs IBOV</p>
            </div>
            {vol != null && (
              <div className="border-l border-border pl-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Volatilidade
                </p>
                <p className="text-[18px] font-semibold leading-none text-foreground">
                  {vol.toFixed(1).replace(".", ",")}%
                </p>
                <p className="mt-1 text-[10.5px] text-muted-foreground">anualizada</p>
              </div>
            )}
          </div>

          {/* ── Linha dupla (watchlist + IBOV) ──────────────────────────── */}
          <DualLineChart
            series={data!.series}
            watchlistColor="#14B8A6"
            ibovColor="#64748B"
            height={150}
          />

          {/* Legenda inline (substitui showLegend do Tremor) */}
          <div className="mt-2 flex items-center gap-4 text-[10.5px]">
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-0.5 w-4 rounded" style={{ backgroundColor: "#14B8A6" }} />
              Watchlist
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="inline-flex h-0.5 w-4 items-center">
                <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke="#64748B" strokeWidth="2" strokeDasharray="3 2" /></svg>
              </span>
              IBOV
            </span>
            <span className="ml-auto flex items-center gap-1 text-muted-foreground/70">
              <span className="h-px w-3 border-t border-dashed border-muted-foreground/40" />
              base 100
            </span>
          </div>

          {/* ── Tickers incluídos / excluídos ──────────────────────────── */}
          {summary && (summary.tickersIncluded.length > 0 || summary.tickersExcluded.length > 0) && (
            <div className="mt-3 space-y-1 text-[10.5px] text-muted-foreground">
              {summary.tickersIncluded.length > 0 && (
                <p>
                  <span className="text-foreground">Inclui:</span>{" "}
                  {summary.tickersIncluded.map((t) => (
                    <span key={t} className="mr-2 font-mono font-medium text-foreground">{t}</span>
                  ))}
                </p>
              )}
              {summary.tickersExcluded.length > 0 && (
                <p>
                  <span>Sem histórico no período:</span>{" "}
                  {summary.tickersExcluded.map((t) => (
                    <span key={t} className="mr-2 font-mono">{t}</span>
                  ))}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RangeSelector({
  value,
  onChange,
}: {
  value: WatchlistPerformanceRange;
  onChange: (r: WatchlistPerformanceRange) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5">
      {PERFORMANCE_RANGES.map((r) => {
        const active = r.key === value;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => onChange(r.key)}
            className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold transition-colors ${
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function fmtSignedPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")}%`;
}

function fmtSignedNumber(n: number | null | undefined, suffix = ""): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")}${suffix}`;
}

function formatBR(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1].slice(2)}` : iso;
}

type SnowflakeAggregate = WatchlistSummary["snowflakeAggregate"];

function SnowflakeAggregateCard({
  aggregate,
  qualityAverage,
  totalWithData,
}: {
  aggregate: SnowflakeAggregate;
  qualityAverage: number | null;
  totalWithData: number;
}) {
  const dims = [
    { key: "value",    label: "Valor",      value: aggregate.value    },
    { key: "future",   label: "Futuro",     value: aggregate.future   },
    { key: "past",     label: "Passado",    value: aggregate.past     },
    { key: "health",   label: "Saúde",      value: aggregate.health   },
    { key: "dividend", label: "Dividendos", value: aggregate.dividend },
  ];

  const hasData = dims.some((d) => d.value != null);
  const status: "healthy" | "attention" | "risk" =
    qualityAverage == null ? "attention" :
    qualityAverage >= 70 ? "healthy" :
    qualityAverage >= 50 ? "attention" :
    "risk";

  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_14px_30px_rgba(15,23,40,0.04)] dark:shadow-none">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <WatchlistMark className="h-4 w-4" />
          <h3 className="text-[13px] font-semibold text-foreground">Snowflake agregada</h3>
        </div>
        <InfoHint text={`Média das 5 dimensões de qualidade (Valor, Futuro, Passado, Saúde, Dividendos) nas ${totalWithData} empresas da sua watchlist que têm dados. Cada dimensão vai de 0 a 100 e agrega vários checks fundamentalistas (dívida/patrimônio, margens, ROE, etc).`} />
      </div>

      {!hasData ? (
        <EmptyHint text="Sem dados suficientes para agregar o snowflake." />
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Snowflake "large" inclui os labels dos 5 eixos ao redor do
              gráfico (Valor, Futuro, Passado, Saúde, Dividendos) — sem eles
              o radar fica abstrato. Centralizado no card. */}
          <div className="flex justify-center px-2">
            <SnowflakeChart
              size="large"
              status={status}
              showTooltip={false}
              dimensions={dims.map((d) => ({
                label: d.label,
                value: d.value ?? 0,
              }))}
            />
          </div>

          {/* Strip horizontal de scores — cada coluna casa visualmente com a
              ponta correspondente do snowflake acima. Mantém a leitura
              numérica precisa que o radar não dá. */}
          <ul className="grid w-full grid-cols-5 gap-2 border-t border-border/60 pt-3">
            {dims.map((d) => (
              <li key={d.key} className="flex flex-col items-center gap-0.5 text-center">
                <span className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {d.label}
                </span>
                <span className="text-[14px] font-semibold tabular-nums text-foreground">
                  {d.value != null ? Math.round(d.value) : "—"}
                  {d.value != null && (
                    <span className="text-[10px] font-normal text-muted-foreground">/100</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-[11px] text-muted-foreground">
      {text}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <section className="space-y-3">
      {/* Skeleton da ilha unificada (header + KPI strip dentro do mesmo card) */}
      <div className="rounded-[24px] border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-[3px] self-stretch rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-16 rounded bg-muted" />
                <div className="h-5 w-20 rounded bg-muted" />
                <div className="h-2 w-24 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-56 rounded-[24px] border border-border bg-card" />
        <div className="h-56 rounded-[24px] border border-border bg-card" />
      </div>
    </section>
  );
}
