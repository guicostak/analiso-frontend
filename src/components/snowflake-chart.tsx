import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface SnowflakeDimension {
  label: string;
  value: number; // 0-100
  color?: string;
  why?: string; // "Why it matters" text for tooltip
  metric?: string; // Short metric for tooltip
  tooltip?: string; // Custom tooltip content
}

export interface SnowflakeChartProps {
  dimensions: SnowflakeDimension[];
  size?: 'large' | 'small';
  status?: 'healthy' | 'attention' | 'risk';
  className?: string;
  onSelect?: (label: string) => void;
  activeLabel?: string;
  showTooltip?: boolean;
}

export function SnowflakeChart({ 
  dimensions, 
  size = 'large', 
  status = 'healthy',
  className = '',
  onSelect,
  activeLabel,
  showTooltip = true
}: SnowflakeChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const isLarge = size === 'large';
  const svgSize = isLarge ? 400 : 160;
  const center = svgSize / 2;
  const maxRadius = isLarge ? 160 : 60;
  const levels = 5;
  
  // Status accent colors (subtle)
  const statusColors = {
    healthy: '#14b8a6', // mint-500
    attention: '#f59e0b', // amber-500
    risk: '#ef4444', // red-500
  };
  
  const accentColor = statusColors[status];

  // Calculate polygon points from values (0-100 scale)
  const getPolygonPoints = (values: number[]) => {
    return values.map((value, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      const radius = (value / 100) * maxRadius;
      return {
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
      };
    });
  };

  // Calculate axis endpoint
  const getAxisPoint = (index: number, radiusMultiplier = 1) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const radius = maxRadius * radiusMultiplier;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  };

  // Calculate label position (outside the chart)
  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const radius = maxRadius * 1.25;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      angle,
    };
  };

  const points = getPolygonPoints(dimensions.map(d => d.value));
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';
  const activeIndex = activeLabel
    ? dimensions.findIndex((dim) => dim.label === activeLabel)
    : -1;

  return (
    <div className={`relative ${className}`}>
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="overflow-visible"
        role="img"
        aria-label="5-dimension radar chart"
      >
        <defs>
          {/* Radial gradient for polygon fill */}
          <radialGradient id={`snowflake-gradient-${status}`}>
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.15" />
            <stop offset="50%" stopColor={accentColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.03" />
          </radialGradient>

          {/* Glow filter for vertex dots */}
          <filter id="vertex-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Soft shadow for polygon */}
          <filter id="polygon-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Back grid layer (faint) */}
        <g opacity="0.3">
          {Array.from({ length: levels }).map((_, level) => {
            const radius = (maxRadius / levels) * (level + 1);
            const gridPoints = dimensions.map((_, i) => {
              const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
              return {
                x: center + Math.cos(angle) * radius,
                y: center + Math.sin(angle) * radius,
              };
            });
            const gridPath = gridPoints.map((p, i) => 
              `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
            ).join(' ') + ' Z';

            return (
              <path
                key={`back-grid-${level}`}
                d={gridPath}
                fill="none"
                stroke="#d1d5db"
                strokeWidth="0.5"
                transform="translate(0, 3)"
              />
            );
          })}
        </g>

        {/* Axis lines */}
        {dimensions.map((_, index) => {
          const end = getAxisPoint(index, 1.05);
          return (
            <line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Front grid layer (crisp) */}
        {Array.from({ length: levels }).map((_, level) => {
          const radius = (maxRadius / levels) * (level + 1);
          const gridPoints = dimensions.map((_, i) => {
            const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
            return {
              x: center + Math.cos(angle) * radius,
              y: center + Math.sin(angle) * radius,
            };
          });
          const gridPath = gridPoints.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
          ).join(' ') + ' Z';

          return (
            <path
              key={`front-grid-${level}`}
              d={gridPath}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity={level === levels - 1 ? 0.8 : 0.5}
            />
          );
        })}

        {/* Hover slice highlights */}
        {hoveredIndex !== null && isLarge && (
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.06 }}
            exit={{ opacity: 0 }}
            d={(() => {
              const prev = getAxisPoint((hoveredIndex - 1 + dimensions.length) % dimensions.length, 1.1);
              const next = getAxisPoint((hoveredIndex + 1) % dimensions.length, 1.1);
              return `M ${center},${center} L ${prev.x},${prev.y} A ${maxRadius * 1.1} ${maxRadius * 1.1} 0 0 1 ${next.x},${next.y} Z`;
            })()}
            fill={accentColor}
          />
        )}

        {/* Data polygon - shadow */}
        <motion.path
          d={pathData}
          fill={accentColor}
          fillOpacity="0.05"
          filter="url(#polygon-shadow)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data polygon - outer soft stroke */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={accentColor}
          strokeWidth={isLarge ? "3" : "2"}
          strokeOpacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Data polygon - gradient fill */}
        <motion.path
          d={pathData}
          fill={`url(#snowflake-gradient-${status})`}
          stroke="none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data polygon - inner crisp stroke */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={accentColor}
          strokeWidth={isLarge ? "2" : "1.5"}
          strokeOpacity="0.9"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Vertex dots with glow */}
        {points.map((point, index) => (
          <motion.circle
            key={`vertex-${index}`}
            cx={point.x}
            cy={point.y}
            r={isLarge ? 4 : 2.5}
            fill={accentColor}
            filter="url(#vertex-glow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.05, type: 'spring', stiffness: 300, damping: 15 }}
            style={{ transformOrigin: `${point.x}px ${point.y}px` }}
            onClick={() => onSelect?.(dimensions[index].label)}
            className={onSelect ? 'cursor-pointer' : undefined}
          />
        ))}

        {activeIndex >= 0 && points[activeIndex] && (
          <>
            <circle
              cx={points[activeIndex].x}
              cy={points[activeIndex].y}
              r={isLarge ? 10 : 6}
              fill="none"
              stroke={accentColor}
              strokeWidth={isLarge ? 2 : 1.5}
              opacity="0.6"
            />
            <line
              x1={center}
              y1={center}
              x2={points[activeIndex].x}
              y2={points[activeIndex].y}
              stroke={accentColor}
              strokeWidth={isLarge ? 2 : 1.5}
              opacity="0.35"
            />
          </>
        )}

        {/* Labels with badges (large size only) */}
        {isLarge && dimensions.map((dim, index) => {
          const labelPos = getLabelPoint(index);
          const isTop = labelPos.y < center - maxRadius * 0.5;
          const isBottom = labelPos.y > center + maxRadius * 0.5;
          const isLeft = labelPos.x < center;
          
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (labelPos.x < center - 10) textAnchor = 'end';
          if (labelPos.x > center + 10) textAnchor = 'start';

          const isHovered = hoveredIndex === index || focusedIndex === index;

          return (
            <g
              key={`label-${index}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              tabIndex={0}
              role="button"
              aria-label={`${dim.label}: ${dim.value} out of 100`}
              className="cursor-pointer outline-none focus:outline-none"
              onClick={() => onSelect?.(dim.label)}
            >
              {/* Label text */}
              <text
                x={labelPos.x}
                y={labelPos.y - (isBottom ? -18 : isTop ? 18 : 0)}
                textAnchor={textAnchor}
                className="text-sm font-medium fill-neutral-700 pointer-events-none select-none"
                style={{ transition: 'all 0.2s' }}
                opacity={isHovered ? 1 : 0.8}
              >
                {dim.label}
              </text>

              {/* Score badge */}
              <g transform={`translate(${labelPos.x}, ${labelPos.y - (isBottom ? -6 : isTop ? 6 : 0)})`}>
                <rect
                  x={textAnchor === 'end' ? -38 : textAnchor === 'start' ? -2 : -18}
                  y={-10}
                  width="36"
                  height="20"
                  rx="10"
                  className="pointer-events-none"
                  style={{ transition: 'all 0.2s' }}
                  fill={isHovered ? accentColor : '#f3f4f6'}
                  opacity={isHovered ? 0.2 : 1}
                />
                <text
                  x={textAnchor === 'end' ? -20 : textAnchor === 'start' ? 16 : 0}
                  y="4"
                  textAnchor="middle"
                  className="text-xs font-semibold pointer-events-none select-none"
                  style={{ transition: 'all 0.2s' }}
                  fill={isHovered ? accentColor : '#374151'}
                >
                  {dim.value.toFixed(0)}
                </text>
              </g>

              {/* Invisible hover target */}
              <circle
                cx={labelPos.x}
                cy={labelPos.y}
                r="30"
                fill="transparent"
              />
            </g>
          );
        })}

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={isLarge ? 3 : 2}
          fill="#9ca3af"
          opacity="0.5"
        />
      </svg>

        {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && hoveredIndex !== null && (dimensions[hoveredIndex].why || dimensions[hoveredIndex].tooltip) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 ${isLarge ? 'w-80' : 'w-64'} bg-white border border-neutral-200 rounded-2xl p-4 shadow-lg z-20`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-mint-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-mint-700">
                  {dimensions[hoveredIndex].value.toFixed(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-neutral-900 mb-1">
                  {dimensions[hoveredIndex].label}
                </h4>
                {dimensions[hoveredIndex].metric && (
                  <p className="text-sm text-mint-600 font-medium mb-2">
                    {dimensions[hoveredIndex].metric}
                  </p>
                )}
                {dimensions[hoveredIndex].tooltip ? (
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {dimensions[hoveredIndex].tooltip}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    <span className="font-medium">Why it matters:</span>{' '}
                    {dimensions[hoveredIndex].why}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mini version optimized for tables/lists
export function SnowflakeChartMini({ 
  dimensions, 
  status = 'healthy',
  className = '' 
}: Omit<SnowflakeChartProps, 'size'>) {
  return (
    <SnowflakeChart 
      dimensions={dimensions}
      size="small"
      status={status}
      className={className}
    />
  );
}
