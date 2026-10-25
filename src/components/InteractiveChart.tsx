import React, { useState, useMemo } from 'react';
import { ChartType, ClimateIndicatorId, DataPoint } from '../types/climate';
import { INDICATOR_METAS } from '../data/climateData';
import { calculateSeriesStats } from '../services/climateService';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';

interface SeriesConfig {
  id: string;
  name: string;
  data: DataPoint[];
  color: string;
}

interface InteractiveChartProps {
  indicator: ClimateIndicatorId;
  series: SeriesConfig[];
  chartType: ChartType;
  onChangeChartType?: (type: ChartType) => void;
  height?: number;
  showStats?: boolean;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  indicator,
  series,
  chartType,
  onChangeChartType,
  height = 360,
  showStats = true,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  const meta = INDICATOR_METAS[indicator];

  // Primary series data
  const primaryData = series[0]?.data || [];

  // Filtered data based on zoom
  const activeSeries = useMemo(() => {
    return series.map((s) => ({
      ...s,
      data: s.data.filter((pt) => {
        if (!zoomRange) return true;
        return pt.year >= zoomRange[0] && pt.year <= zoomRange[1];
      }),
    }));
  }, [series, zoomRange]);

  const displayData = activeSeries[0]?.data || [];
  const stats = useMemo(() => calculateSeriesStats(displayData), [displayData]);

  // Determine global min and max across all series for consistent scale
  const { minVal, maxVal, minYear, maxYear } = useMemo(() => {
    let minV = Infinity;
    let maxV = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    activeSeries.forEach((s) => {
      s.data.forEach((pt) => {
        if (pt.value < minV) minV = pt.value;
        if (pt.value > maxV) maxV = pt.value;
        if (pt.year < minY) minY = pt.year;
        if (pt.year > maxY) maxY = pt.year;
      });
    });

    if (minV === Infinity) {
      minV = 0;
      maxV = 100;
      minY = 1880;
      maxY = 2026;
    }

    // Add padding to value range
    const valSpan = maxV - minV || 1;
    const paddedMin = minV - valSpan * 0.1;
    const paddedMax = maxV + valSpan * 0.1;

    return {
      minVal: paddedMin,
      maxVal: paddedMax,
      minYear: minY,
      maxYear: maxY,
    };
  }, [activeSeries]);

  const svgWidth = 840;
  const svgHeight = height;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  // Coordinate mappers
  const getX = (year: number) => {
    if (maxYear === minYear) return padding.left + chartW / 2;
    return padding.left + ((year - minYear) / (maxYear - minYear)) * chartW;
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return padding.top + chartH / 2;
    return padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  };

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const v = minVal + ((maxVal - minVal) / (count - 1)) * i;
      ticks.push(v);
    }
    return ticks;
  }, [minVal, maxVal]);

  // X-axis ticks (years)
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const span = maxYear - minYear;
    const step = span > 80 ? 25 : span > 40 ? 10 : 5;
    const first = Math.ceil(minYear / step) * step;
    for (let y = first; y <= maxYear; y += step) {
      ticks.push(y);
    }
    return ticks;
  }, [minYear, maxYear]);

  // Baseline zero reference line if within bounds
  const zeroY = minVal <= 0 && maxVal >= 0 ? getY(0) : null;

  // Zoom preset handlers
  const handleZoomPreset = (yearsBack: number) => {
    const end = 2026;
    const start = Math.max(1880, end - yearsBack);
    setZoomRange([start, end]);
  };

  const handleResetZoom = () => {
    setZoomRange(null);
  };

  return (
    <div className="w-full rounded-2xl bg-surface-1/95 border border-slate-800/80 p-5 shadow-xl space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
        {/* Title and dataset legend */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Metric Projection
            </span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-emerald-400 font-mono">
              {meta.name} ({meta.unit})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-0.5">
            {series.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 font-medium text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart type & Zoom Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart type switch */}
          {onChangeChartType && (
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs">
              {(['line', 'area', 'bar'] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onChangeChartType(type)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-all ${
                    chartType === type
                      ? 'bg-slate-800 text-emerald-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Quick Time Range Presets */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
            <button
              onClick={() => handleZoomPreset(10)}
              className="px-2 py-1 rounded hover:text-slate-200 transition-colors"
              title="Last 10 Years"
            >
              10Y
            </button>
            <button
              onClick={() => handleZoomPreset(30)}
              className="px-2 py-1 rounded hover:text-slate-200 transition-colors"
              title="Last 30 Years"
            >
              30Y
            </button>
            <button
              onClick={() => handleZoomPreset(70)}
              className="px-2 py-1 rounded hover:text-slate-200 transition-colors"
              title="Last 70 Years"
            >
              70Y
            </button>
            <button
              onClick={handleResetZoom}
              className={`px-2 py-1 rounded hover:text-slate-200 transition-colors ${
                !zoomRange ? 'text-emerald-400 font-medium' : ''
              }`}
              title="Full Historical Period (1880–2026)"
            >
              ALL
            </button>
          </div>

          {zoomRange && (
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible font-mono"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Subtle Grid Lines */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={`ytick-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="2 3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Zero Baseline highlight */}
          {zeroY !== null && (
            <line
              x1={padding.left}
              y1={zeroY}
              x2={svgWidth - padding.right}
              y2={zeroY}
              stroke="#64748b"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          )}

          {/* X Axis ticks */}
          {xTicks.map((year) => {
            const x = getX(year);
            return (
              <g key={`xtick-${year}`}>
                <line
                  x1={x}
                  y1={svgHeight - padding.bottom}
                  x2={x}
                  y2={svgHeight - padding.bottom + 5}
                  stroke="#475569"
                />
                <text
                  x={x}
                  y={svgHeight - padding.bottom + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                >
                  {year}
                </text>
              </g>
            );
          })}

          {/* Render Area fill under curves if area chart */}
          {chartType === 'area' &&
            activeSeries.map((s) => {
              if (s.data.length === 0) return null;
              const points = s.data.map((d) => `${getX(d.year)},${getY(d.value)}`);
              const baselineY = svgHeight - padding.bottom;
              const areaPath = `M ${getX(s.data[0].year)},${baselineY} L ${points.join(
                ' L '
              )} L ${getX(s.data[s.data.length - 1].year)},${baselineY} Z`;

              return (
                <path
                  key={`area-${s.id}`}
                  d={areaPath}
                  fill={`url(#area-grad-${s.id})`}
                  opacity="0.35"
                />
              );
            })}

          {/* Render Line or Bars */}
          {chartType === 'bar'
            ? activeSeries.map((s, seriesIdx) => {
                const barWidth = Math.max(
                  2,
                  (chartW / (s.data.length || 1)) * (0.6 / activeSeries.length)
                );
                return (
                  <g key={`bars-${s.id}`}>
                    {s.data.map((d, i) => {
                      const xCenter = getX(d.year);
                      const xOffset = (seriesIdx - (activeSeries.length - 1) / 2) * (barWidth + 1);
                      const y = getY(d.value);
                      const baseY = zeroY !== null ? zeroY : svgHeight - padding.bottom;
                      const rectY = Math.min(y, baseY);
                      const rectH = Math.abs(y - baseY);

                      return (
                        <rect
                          key={`bar-${s.id}-${d.year}`}
                          x={xCenter + xOffset - barWidth / 2}
                          y={rectY}
                          width={barWidth}
                          height={Math.max(1, rectH)}
                          fill={s.color}
                          rx={1.5}
                          opacity={hoverIndex === i ? 1 : 0.85}
                        />
                      );
                    })}
                  </g>
                );
              })
            : activeSeries.map((s) => {
                if (s.data.length === 0) return null;
                const points = s.data.map((d) => `${getX(d.year)},${getY(d.value)}`);
                const linePath = `M ${points.join(' L ')}`;

                return (
                  <path
                    key={`line-${s.id}`}
                    d={linePath}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

          {/* Interactive Transparent Hover Columns */}
          {displayData.map((d, idx) => {
            const x = getX(d.year);
            const colW = chartW / (displayData.length || 1);

            return (
              <rect
                key={`hover-col-${d.year}`}
                x={x - colW / 2}
                y={padding.top}
                width={colW}
                height={chartH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}

          {/* Hover Crosshair & Data Node Dots */}
          {hoverIndex !== null && displayData[hoverIndex] && (
            <g>
              {/* Vertical Crosshair */}
              <line
                x1={getX(displayData[hoverIndex].year)}
                y1={padding.top}
                x2={getX(displayData[hoverIndex].year)}
                y2={svgHeight - padding.bottom}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Data Node Dots */}
              {activeSeries.map((s) => {
                const pt = s.data[hoverIndex];
                if (!pt) return null;
                const x = getX(pt.year);
                const y = getY(pt.value);

                return (
                  <g key={`dot-${s.id}`}>
                    <circle cx={x} cy={y} r="5" fill="#090d19" stroke={s.color} strokeWidth="2.5" />
                    <circle cx={x} cy={y} r="2" fill={s.color} />
                  </g>
                );
              })}
            </g>
          )}

          {/* Area Gradients Defs */}
          <defs>
            {activeSeries.map((s) => (
              <linearGradient
                key={`grad-${s.id}`}
                id={`area-grad-${s.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && displayData[hoverIndex] && (
          <div
            className="absolute top-4 pointer-events-none rounded-xl bg-slate-900/95 border border-slate-700/80 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 transition-all duration-75"
            style={{
              left: `${Math.min(
                Math.max(10, (getX(displayData[hoverIndex].year) / svgWidth) * 100),
                70
              )}%`,
            }}
          >
            <div className="flex items-center justify-between gap-4 font-mono pb-1 border-b border-slate-800 text-[11px]">
              <span className="text-slate-400">Year</span>
              <span className="text-white font-bold">{displayData[hoverIndex].year}</span>
            </div>

            {activeSeries.map((s) => {
              const pt = s.data[hoverIndex];
              if (!pt) return null;
              return (
                <div key={`tip-${s.id}`} className="flex items-center justify-between gap-5 font-mono">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-[11px] truncate max-w-[120px]">{s.name}</span>
                  </span>
                  <span className="font-semibold text-white">
                    {meta.kpiFormat(pt.value)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Statistical Strip */}
      {showStats && stats && (
        <div className="pt-3 border-t border-slate-800/70 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-400 block">Net Delta</span>
            <span
              className={`font-semibold text-sm ${
                stats.delta > 0 ? 'text-orange-400' : 'text-emerald-400'
              }`}
            >
              {stats.delta > 0 ? `+${stats.delta}` : stats.delta} {meta.unit}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-400 block">Decadal Rate</span>
            <span className="font-semibold text-sm text-cyan-300">
              {stats.ratePerDecade > 0 ? `+${stats.ratePerDecade}` : stats.ratePerDecade} {meta.unit}/dec
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-400 block">Observed Min</span>
            <span className="font-semibold text-sm text-slate-200">
              {stats.min} {meta.unit}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-400 block">Observed Max</span>
            <span className="font-semibold text-sm text-slate-200">
              {stats.max} {meta.unit}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase text-slate-400 block">Period Average</span>
            <span className="font-semibold text-sm text-slate-200">
              {stats.avg} {meta.unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
