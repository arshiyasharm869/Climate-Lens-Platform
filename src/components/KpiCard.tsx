import React from 'react';
import { ClimateIndicatorId } from '../types/climate';
import { INDICATOR_METAS } from '../data/climateData';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface KpiCardProps {
  indicator: ClimateIndicatorId;
  label: string;
  value: string;
  changeText: string;
  trend: 'up' | 'down';
  reference: string;
  datasetNote?: string;
  sparklineData?: number[];
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  indicator,
  label,
  value,
  changeText,
  trend,
  reference,
  datasetNote = 'Demonstration sample data based on scientific reference baselines',
  sparklineData = [10, 12, 11, 14, 18, 22, 29, 36, 45, 54, 68, 85],
  onClick,
}) => {
  const meta = INDICATOR_METAS[indicator];
  const isUp = trend === 'up';

  // Generate SVG sparkline path
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 120;
  const height = 36;
  const points = sparklineData.map((d, i) => {
    const x = (i / (sparklineData.length - 1)) * width;
    const y = height - ((d - minVal) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl bg-surface-1/90 border border-slate-800/80 hover:border-slate-700/80 p-5 transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-emerald-950/10 flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            {meta.shortName} · {meta.unit}
          </span>
          <h3 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
            {label}
          </h3>
        </div>

        {/* Indicator icon / symbol */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-semibold shrink-0"
          style={{
            backgroundColor: `${meta.color}15`,
            color: meta.color,
            border: `1px solid ${meta.color}35`,
          }}
          title={meta.name}
        >
          {meta.symbol}
        </div>
      </div>

      {/* Primary Metric Value & Sparkline */}
      <div className="flex items-end justify-between gap-3 my-2">
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
            {value}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span
              className={`font-medium ${
                meta.higherIsWorse
                  ? isUp ? 'text-orange-400' : 'text-emerald-400'
                  : isUp ? 'text-emerald-400' : 'text-orange-400'
              }`}
            >
              {changeText}
            </span>
          </div>
        </div>

        {/* Sparkline Graphic */}
        <div className="shrink-0 pb-1">
          <svg width={width} height={height} className="overflow-visible opacity-85 group-hover:opacity-100 transition-opacity">
            <path
              d={pathD}
              fill="none"
              stroke={meta.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* End point pulse */}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].split(',')[0]}
                cy={points[points.length - 1].split(',')[1]}
                r="3"
                fill={meta.color}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Baseline Reference & Dataset Sample Label */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="truncate">{reference}</span>
          <span className="font-mono text-slate-400 shrink-0">1880–2026</span>
        </div>

        {/* Mandatory Sample / Demo Data Notice */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
          <Info className="w-2.5 h-2.5 shrink-0 text-cyan-400" />
          <span className="truncate">{datasetNote}</span>
        </div>
      </div>
    </div>
  );
};
