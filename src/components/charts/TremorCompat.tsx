"use client";

/**
 * Drop-in replacements for @tremor/react chart components using recharts directly.
 * Maintains the same prop API so existing usage doesn't need to change.
 */

import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import type { ReactElement } from "react";

// ─── Tremor color name → hex ────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6",
  sky: "#0ea5e9",
  teal: "#14b8a6",
  violet: "#8b5cf6",
  slate: "#94a3b8",
  amber: "#f59e0b",
  emerald: "#10b981",
  rose: "#f43f5e",
  red: "#ef4444",
  green: "#22c55e",
  indigo: "#6366f1",
  purple: "#a855f7",
  pink: "#ec4899",
  orange: "#f97316",
  yellow: "#eab308",
  cyan: "#06b6d4",
  lime: "#84cc16",
  gray: "#9ca3af",
  neutral: "#a3a3a3",
};

function resolveColor(name: string): string {
  return COLOR_MAP[name] ?? name;
}

// ─── Shared tooltip type (matches Tremor's CustomTooltipProps) ───────────────
export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: string | number;
    name: string;
    payload: Record<string, unknown>;
    color?: string;
  }>;
  label?: string;
}

// ─── Shared props ───────────────────────────────────────────────────────────
interface BaseChartProps {
  data: Record<string, unknown>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showGridLines?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisWidth?: number;
  customTooltip?: (props: CustomTooltipProps) => ReactElement | null;
}

// ─── AreaChart ──────────────────────────────────────────────────────────────
interface AreaChartProps extends BaseChartProps {
  curveType?: "monotone" | "linear" | "natural";
}

export function TremorAreaChart({
  data,
  index,
  categories,
  colors = ["blue"],
  valueFormatter,
  showLegend = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 56,
  curveType = "monotone",
  customTooltip: CustomTooltipComponent,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        {showXAxis && <XAxis dataKey={index} tick={{ fontSize: 12 }} stroke="#9ca3af" />}
        {showYAxis && (
          <YAxis
            width={yAxisWidth}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            tickFormatter={valueFormatter}
          />
        )}
        <Tooltip
          content={
            CustomTooltipComponent
              ? (props) => <CustomTooltipComponent {...(props as unknown as CustomTooltipProps)} />
              : undefined
          }
          formatter={valueFormatter ? (v: unknown) => valueFormatter(v as number) : undefined}
        />
        {showLegend && <Legend />}
        {categories.map((cat, i) => (
          <Area
            key={cat}
            type={curveType}
            dataKey={cat}
            stroke={resolveColor(colors[i % colors.length])}
            fill={resolveColor(colors[i % colors.length])}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── BarChart ────────────────────────────────────────────────────────────────
interface BarChartProps extends BaseChartProps {
  layout?: "horizontal" | "vertical";
}

export function TremorBarChart({
  data,
  index,
  categories,
  colors = ["blue"],
  valueFormatter,
  showLegend = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 56,
  layout = "horizontal",
  customTooltip: CustomTooltipComponent,
}: BarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={isVertical ? "vertical" : "horizontal"}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        {isVertical ? (
          <>
            {showYAxis && <YAxis dataKey={index} type="category" width={yAxisWidth} tick={{ fontSize: 12 }} stroke="#9ca3af" />}
            {showXAxis && <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={valueFormatter} />}
          </>
        ) : (
          <>
            {showXAxis && <XAxis dataKey={index} tick={{ fontSize: 12 }} stroke="#9ca3af" />}
            {showYAxis && <YAxis width={yAxisWidth} tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={valueFormatter} />}
          </>
        )}
        <Tooltip
          content={
            CustomTooltipComponent
              ? (props) => <CustomTooltipComponent {...(props as unknown as CustomTooltipProps)} />
              : undefined
          }
          formatter={valueFormatter ? (v: unknown) => valueFormatter(v as number) : undefined}
        />
        {showLegend && <Legend />}
        {categories.map((cat, i) => (
          <Bar
            key={cat}
            dataKey={cat}
            fill={resolveColor(colors[i % colors.length])}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── LineChart ───────────────────────────────────────────────────────────────
interface LineChartProps extends BaseChartProps {
  curveType?: "monotone" | "linear" | "natural";
}

export function TremorLineChart({
  data,
  index,
  categories,
  colors = ["blue"],
  valueFormatter,
  showLegend = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 56,
  curveType = "monotone",
  customTooltip: CustomTooltipComponent,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        {showXAxis && <XAxis dataKey={index} tick={{ fontSize: 12 }} stroke="#9ca3af" />}
        {showYAxis && (
          <YAxis
            width={yAxisWidth}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            tickFormatter={valueFormatter}
          />
        )}
        <Tooltip
          content={
            CustomTooltipComponent
              ? (props) => <CustomTooltipComponent {...(props as unknown as CustomTooltipProps)} />
              : undefined
          }
          formatter={valueFormatter ? (v: unknown) => valueFormatter(v as number) : undefined}
        />
        {showLegend && <Legend />}
        {categories.map((cat, i) => (
          <Line
            key={cat}
            type={curveType}
            dataKey={cat}
            stroke={resolveColor(colors[i % colors.length])}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── DonutChart ─────────────────────────────────────────────────────────────
interface DonutChartProps {
  data: Record<string, unknown>[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLabel?: boolean;
  showAnimation?: boolean;
}

export function TremorDonutChart({
  data,
  category,
  index,
  colors = ["blue", "sky"],
  valueFormatter,
  showLabel = false,
  showAnimation = true,
}: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={category}
          nameKey={index}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="85%"
          paddingAngle={2}
          isAnimationActive={showAnimation}
          label={showLabel}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={resolveColor(colors[i % colors.length])} />
          ))}
        </Pie>
        <Tooltip
          formatter={valueFormatter ? (v: unknown) => valueFormatter(v as number) : undefined}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
