/**
 * Mappers DTO (backend) → Model (UI) para os novos extras da aba Contexto.
 * Nenhum I/O aqui. Seguem o padrão já estabelecido em services/index.ts.
 */

import type {
  ExploreIndexCardDto,
  ExploreMarketExtrasDto,
  MarketRibbonDto,
  MarketToneDto,
  ExploreRiskPanelDto,
  BreadthDto,
  FearGreedDto,
  VolatilityMiniDto,
  VixMiniDto,
  DxyMiniDto,
  DiCurveDto,
  DiCurvePointDto,
  MacroIndicatorDto,
  EconomicCycleDto,
  MacroIndicatorsBundleDto,
  SectorHeatmapDto,
  SectorHeatmapItemDto,
  ComparisonDto,
  GlobalMacroBundleDto,
} from "../services";

import { mapIndexCardDto } from "../services";

import type {
  MarketExtras,
  MarketRibbon,
  MarketToneHighlights,
  RiskPanel,
  BreadthIndicator,
  FearGreedIndicator,
  VolatilityMini,
  IndexMini,
  DiCurve,
  DiCurvePoint,
  MacroIndicator,
  EconomicCycle,
  MacroIndicatorsBundle,
  SectorHeatmap,
  SectorHeatmapItem,
  Comparison,
  GlobalMacroBundle,
  MarketStatus,
  MarketTone,
} from "../interfaces/market.interfaces";
import type { IndexCard, IndexCardTrend } from "../interfaces";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeTrend = (raw: string | null | undefined): IndexCardTrend => {
  const t = (raw ?? "").toLowerCase();
  if (t === "up" || t === "down" || t === "neutral") return t as IndexCardTrend;
  return "neutral";
};

const safeMarketStatus = (raw: string | null | undefined): MarketStatus | null => {
  if (!raw) return null;
  const u = raw.toUpperCase();
  return u === "OPEN" || u === "CLOSED" || u === "PRE_MARKET" ? (u as MarketStatus) : null;
};

const safeMarketTone = (raw: string | null | undefined): MarketTone => {
  const u = (raw ?? "").toUpperCase();
  if (u === "BULLISH" || u === "BEARISH") return u;
  return "NEUTRAL";
};

// ─── Ribbon ───────────────────────────────────────────────────────────────────

export const mapRibbon = (dto: MarketRibbonDto | null | undefined): MarketRibbon | null => {
  if (!dto) return null;
  const tickers: IndexCard[] = (dto.tickers ?? [])
    .map((t: ExploreIndexCardDto) => mapIndexCardDto(t));
  return {
    tickers,
    marketStatus:  safeMarketStatus(dto.marketStatus),
    lastUpdatedAt: dto.lastUpdatedAt ?? null,
  };
};

// ─── Tone ─────────────────────────────────────────────────────────────────────

export const mapMarketTone = (
  dto: MarketToneDto | null | undefined,
): MarketToneHighlights | null => {
  if (!dto) return null;
  return {
    tone:       safeMarketTone(dto.tone),
    label:      dto.label ?? "Neutro",
    highlights: Array.isArray(dto.highlights) ? dto.highlights.filter(Boolean) : [],
  };
};

// ─── Risk panel ───────────────────────────────────────────────────────────────

const mapBreadth = (d: BreadthDto | null | undefined): BreadthIndicator | null => {
  if (!d) return null;
  return {
    up:        d.up        ?? 0,
    down:      d.down      ?? 0,
    unchanged: d.unchanged ?? 0,
    total:     d.total     ?? 0,
    ratioUp:   typeof d.ratioUp === "number" ? d.ratioUp : 0,
  };
};

const mapVolatilityMini = (d: VolatilityMiniDto | null | undefined): VolatilityMini | null => {
  if (!d) return null;
  return {
    score:       d.score ?? null,
    statusKey:   d.statusKey ?? null,
    statusLabel: d.statusLabel ?? null,
    metaLine:    d.metaLine ?? null,
    indexLabel:  d.indexLabel ?? null,
  };
};

const mapFearGreed = (d: FearGreedDto | null | undefined): FearGreedIndicator | null => {
  if (!d) return null;
  return {
    score:     d.score,
    label:     d.label,
    source:    d.source,
    sourceUrl: d.sourceUrl ?? null,
    asOfDate:  d.asOfDate ?? null,
  };
};

const mapIndexMini = (d: VixMiniDto | DxyMiniDto | null | undefined): IndexMini | null => {
  if (!d) return null;
  return {
    value:     d.value ?? null,
    changePct: d.changePct ?? null,
    trend:     safeTrend(d.trend ?? null),
  };
};

const mapDiCurvePoint = (d: DiCurvePointDto): DiCurvePoint => ({
  tenorDays:      d.tenorDays,
  tenorLabel:     d.tenorLabel,
  yieldPct:       d.yieldPct,
  yieldFormatted: d.yieldFormatted,
  changeBps:      d.changeBps ?? null,
  changeLabel:    d.changeLabel ?? null,
  trend:          safeTrend(d.trend),
});

const mapDiCurve = (dto: DiCurveDto | null | undefined): DiCurve | null => {
  if (!dto) return null;
  return {
    curveType: dto.curveType,
    label:     dto.label,
    asOfDate:  dto.asOfDate ?? null,
    points:    Array.isArray(dto.points) ? dto.points.map(mapDiCurvePoint) : [],
    source:    dto.source ?? null,
    sourceUrl: dto.sourceUrl ?? null,
    summary:   dto.summary ?? null,
  };
};

export const mapRiskPanel = (
  dto: ExploreRiskPanelDto | null | undefined,
): RiskPanel | null => {
  if (!dto) return null;
  return {
    volatility: mapVolatilityMini(dto.volatility),
    breadth:    mapBreadth(dto.breadth),
    fearGreed:  mapFearGreed(dto.fearGreed),
    vix:        mapIndexMini(dto.vix),
    dxy:        mapIndexMini(dto.dxy),
    diCurve:    mapDiCurve(dto.diCurve),
  };
};

// ─── Macro BR ─────────────────────────────────────────────────────────────────

const mapMacroIndicator = (d: MacroIndicatorDto | null | undefined): MacroIndicator | null => {
  if (!d) return null;
  return {
    key:            d.indicatorKey,
    label:          d.label,
    value:          d.value ?? null,
    changeLabel:    d.changeLabel ?? null,
    trend:          safeTrend(d.trend),
    asOfDate:       d.asOfDate ?? null,
    sparkline:      Array.isArray(d.sparkline) ? d.sparkline : [],
    sparklineDates: Array.isArray(d.sparklineDates) ? d.sparklineDates : undefined,
    subtitle:       d.subtitle ?? null,
  };
};

const mapEconomicCycle = (d: EconomicCycleDto | null | undefined): EconomicCycle | null => {
  if (!d) return null;
  return {
    phaseKey:        d.phaseKey,
    phaseLabel:      d.phaseLabel,
    growthStatus:    d.growthStatus,
    inflationStatus: d.inflationStatus,
    confidence:      d.confidence,
    description:     d.description ?? null,
    metaLine:        d.metaLine ?? null,
  };
};

export const mapMacroBr = (
  dto: MacroIndicatorsBundleDto | null | undefined,
): MacroIndicatorsBundle | null => {
  if (!dto) return null;
  return {
    selic:         mapMacroIndicator(dto.selic),
    ipca:          mapMacroIndicator(dto.ipca),
    ibcBr:         mapMacroIndicator(dto.ibcBr),
    economicCycle: mapEconomicCycle(dto.economicCycle),
  };
};

// ─── Sector heatmap ───────────────────────────────────────────────────────────

const mapSectorHeatmapItem = (d: SectorHeatmapItemDto): SectorHeatmapItem => ({
  sector:         d.sector,
  avgChangePct:   d.avgChangePct ?? null,
  companiesCount: d.companiesCount ?? null,
  topTickers:     Array.isArray(d.topTickers) ? d.topTickers : [],
});

export const mapSectorHeatmap = (
  dto: SectorHeatmapDto | null | undefined,
): SectorHeatmap | null => {
  if (!dto) return null;
  return {
    sectors:   (dto.sectors ?? []).map(mapSectorHeatmapItem),
    asOfLabel: dto.asOfLabel ?? null,
  };
};

// ─── Comparisons ──────────────────────────────────────────────────────────────

export const mapComparison = (d: ComparisonDto): Comparison => ({
  key:             d.key,
  label:           d.label,
  value:           d.value ?? null,
  changePct:       d.changePct ?? null,
  trend:           safeTrend(d.trend),
  sparkline:       d.sparkline ?? null,
  sparklineDates:  Array.isArray(d.sparklineDates) ? d.sparklineDates : undefined,
  formula:         d.formula ?? undefined,
  description:     d.description ?? null,
});

// ─── Macro global ─────────────────────────────────────────────────────────────

export const mapGlobalMacro = (
  dto: GlobalMacroBundleDto | null | undefined,
): GlobalMacroBundle | null => {
  if (!dto) return null;
  const m = (x: ExploreIndexCardDto | null) => (x ? mapIndexCardDto(x) : null);
  return {
    brent:   m(dto.brent),
    wti:     m(dto.wti),
    gold:    m(dto.gold),
    ironOre: m(dto.ironOre),
    bitcoin: m(dto.bitcoin),
  };
};

// ─── Top-level bundle ─────────────────────────────────────────────────────────

export const mapMarketExtras = (
  dto: ExploreMarketExtrasDto | null | undefined,
): MarketExtras | null => {
  if (!dto) return null;
  return {
    ribbon:        mapRibbon(dto.ribbon),
    marketTone:    mapMarketTone(dto.marketTone),
    riskPanel:     mapRiskPanel(dto.riskPanel),
    sectorHeatmap: mapSectorHeatmap(dto.sectorHeatmap),
    macroBr:       mapMacroBr(dto.macroBr),
    macroGlobal:   mapGlobalMacro(dto.macroGlobal),
    comparisons:   Array.isArray(dto.comparisons) ? dto.comparisons.map(mapComparison) : [],
  };
};
