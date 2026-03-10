/**
 * Snowflake Chart - Usage Examples
 * 
 * A premium 2.5D radar chart component for visualizing 5-dimensional data
 * with subtle depth effects, smooth animations, and interactive tooltips.
 */

import { SnowflakeChart, SnowflakeChartMini, SnowflakeDimension } from './snowflake-chart';

// Example 1: Basic usage with company health metrics
export function ExampleBasicUsage() {
  const dimensions: SnowflakeDimension[] = [
    {
      label: 'Growth',
      value: 88,
      why: 'Revenue growth accelerated from 28% to 42% YoY, outpacing sector averages.',
      metric: '+42% YoY revenue',
    },
    {
      label: 'Profitability',
      value: 82,
      why: 'Operating margins expanded to 34%, up 5 percentage points from last quarter.',
      metric: '34% operating margin',
    },
    {
      label: 'Debt Health',
      value: 95,
      why: 'Fortress balance sheet with $2.1B net cash and zero debt provides financial flexibility.',
      metric: '$2.1B net cash',
    },
    {
      label: 'Valuation',
      value: 52,
      why: 'Trading at P/E 45x vs sector 28x, representing a 61% premium to peers.',
      metric: 'P/E 45x',
    },
    {
      label: 'Momentum',
      value: 85,
      why: 'Strong price momentum with positive analyst revisions and earnings beats.',
      metric: '+18.5% (12M)',
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
        Company Health Assessment
      </h2>
      <SnowflakeChart 
        dimensions={dimensions}
        size="large"
        status="healthy"
      />
    </div>
  );
}

// Example 2: Mini version for table/list usage
export function ExampleMiniInTable() {
  const companies = [
    {
      name: 'TechVision Inc',
      ticker: 'TCHV',
      dimensions: [
        { label: 'Growth', value: 88 },
        { label: 'Profit', value: 82 },
        { label: 'Debt', value: 95 },
        { label: 'Value', value: 52 },
        { label: 'Momentum', value: 85 },
      ],
      status: 'healthy' as const,
    },
    {
      name: 'RetailCo Ltd',
      ticker: 'RTCL',
      dimensions: [
        { label: 'Growth', value: 45 },
        { label: 'Profit', value: 62 },
        { label: 'Debt', value: 58 },
        { label: 'Value', value: 78 },
        { label: 'Momentum', value: 55 },
      ],
      status: 'attention' as const,
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
        Company Comparison
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {companies.map((company) => (
          <div key={company.ticker} className="bg-white border border-neutral-200 rounded-2xl p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-neutral-900">{company.name}</h3>
              <p className="text-sm text-neutral-500">{company.ticker}</p>
            </div>
            <div className="flex justify-center">
              <SnowflakeChartMini 
                dimensions={company.dimensions}
                status={company.status}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 3: Different status states
export function ExampleStatusStates() {
  const baseDimensions = [
    { label: 'Growth', value: 75 },
    { label: 'Profitability', value: 70 },
    { label: 'Debt Health', value: 80 },
    { label: 'Valuation', value: 65 },
    { label: 'Momentum', value: 72 },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
        Status Variations
      </h2>
      <div className="grid grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-medium text-neutral-700 mb-4">Healthy</h3>
          <SnowflakeChart 
            dimensions={baseDimensions}
            size="large"
            status="healthy"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-700 mb-4">Needs Attention</h3>
          <SnowflakeChart 
            dimensions={baseDimensions.map(d => ({ ...d, value: d.value * 0.7 }))}
            size="large"
            status="attention"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-700 mb-4">At Risk</h3>
          <SnowflakeChart 
            dimensions={baseDimensions.map(d => ({ ...d, value: d.value * 0.5 }))}
            size="large"
            status="risk"
          />
        </div>
      </div>
    </div>
  );
}

// Example 4: Animated value changes
export function ExampleAnimatedChanges() {
  const [quarter, setQuarter] = React.useState(0);

  const quarterlyData = [
    [65, 70, 75, 60, 68], // Q1
    [70, 73, 78, 62, 72], // Q2
    [75, 78, 82, 65, 78], // Q3
    [82, 82, 85, 58, 85], // Q4
  ];

  const dimensions: SnowflakeDimension[] = [
    { label: 'Growth', value: quarterlyData[quarter][0] },
    { label: 'Profitability', value: quarterlyData[quarter][1] },
    { label: 'Debt Health', value: quarterlyData[quarter][2] },
    { label: 'Valuation', value: quarterlyData[quarter][3] },
    { label: 'Momentum', value: quarterlyData[quarter][4] },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
        Quarterly Performance Evolution
      </h2>
      
      <div className="mb-6">
        <SnowflakeChart 
          dimensions={dimensions}
          size="large"
          status="healthy"
        />
      </div>

      <div className="flex gap-2">
        {['Q1', 'Q2', 'Q3', 'Q4'].map((label, index) => (
          <button
            key={index}
            onClick={() => setQuarter(index)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              quarter === index
                ? 'bg-mint-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Design System Integration Notes:
 * 
 * COLOR SYSTEM:
 * - Primary accent: mint (#14b8a6) for data visualization
 * - Status colors:
 *   - Healthy: mint (#14b8a6)
 *   - Attention: amber (#f59e0b)
 *   - Risk: red (#ef4444)
 * - Neutrals: neutral-50 through neutral-900 for backgrounds and text
 * 
 * SPACING:
 * - Large charts: 400x400px viewport
 * - Mini charts: 160x160px viewport
 * - Padding: 8 (2rem) for cards containing charts
 * 
 * TYPOGRAPHY:
 * - Labels: text-sm (14px), font-medium
 * - Scores: text-xs (12px), font-semibold
 * - Tooltips: text-xs for body, text-sm for title
 * 
 * BORDERS & RADII:
 * - Card containers: rounded-3xl (1.5rem)
 * - Tooltip: rounded-2xl (1rem)
 * - Score badges: rounded-full (9999px)
 * 
 * SHADOWS:
 * - Chart polygon: subtle drop shadow (2px offset, 3px blur, 20% opacity)
 * - Tooltip: shadow-lg
 * 
 * ANIMATIONS:
 * - Path drawing: 500ms ease-out
 * - Vertex appearance: spring animation (stiffness: 300, damping: 15)
 * - Tooltip: 200ms ease with 5px y-offset
 * - Hover transitions: 200ms all
 * 
 * ACCESSIBILITY:
 * - Keyboard focusable axis labels
 * - ARIA labels for screen readers
 * - Focus visible on interactive elements
 * - Sufficient color contrast for all text
 * 
 * RESPONSIVE BEHAVIOR:
 * - SVG scales proportionally via viewBox
 * - Container handles sizing via className prop
 * - Works in grid layouts and flex containers
 * 
 * CONSISTENCY TIPS:
 * 1. Always use the same 5 dimensions in the same order
 * 2. Keep score scale 0-100 for consistency
 * 3. Use status prop to match overall app health indicators
 * 4. Provide meaningful "why it matters" text for all dimensions
 * 5. Keep tooltip metrics concise (1 line max)
 */

import React from 'react';
