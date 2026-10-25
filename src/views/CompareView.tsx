import React, { useState, useMemo } from 'react';
import { ClimateIndicatorId, RegionData } from '../types/climate';
import { INDICATOR_METAS, REGIONS_DATA, getRegionById } from '../data/climateData';
import { getSeriesData } from '../services/climateService';
import {
  GitCompare,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface CompareViewProps {
  initialRegionA?: string;
  initialRegionB?: string;
}

export const CompareView: React.FC<CompareViewProps> = ({
  initialRegionA = 'in',
  initialRegionB = 'us',
}) => {
  const [regionAId, setRegionAId] = useState<string>(initialRegionA);
  const [regionBId, setRegionBId] = useState<string>(initialRegionB);
  const [selectedTab, setSelectedTab] = useState<'Temperature' | 'CO₂ Emissions' | 'Sea Level' | 'Rainfall' | 'Forest Cover'>('Temperature');

  const regionA = getRegionById(regionAId);
  const regionB = getRegionById(regionBId);

  // Map tab name to climate indicator ID
  const indicatorMap: Record<string, ClimateIndicatorId> = {
    Temperature: 'temperature',
    'CO₂ Emissions': 'co2',
    'Sea Level': 'sea_level',
    Rainfall: 'precipitation',
    'Forest Cover': 'forest_cover',
  };
  const activeIndicatorId = indicatorMap[selectedTab] || 'temperature';

  const seriesA = useMemo(
    () => getSeriesData(activeIndicatorId, regionAId, 1880, 2026),
    [activeIndicatorId, regionAId]
  );
  const seriesB = useMemo(
    () => getSeriesData(activeIndicatorId, regionBId, 1880, 2026),
    [activeIndicatorId, regionBId]
  );

  // Chart setup
  const svgWidth = 800;
  const svgHeight = 260;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const minYear = 1880;
  const maxYear = 2026;

  // Global min and max across both series
  const allVals = [...seriesA.map((d) => d.value), ...seriesB.map((d) => d.value)];
  const minVal = Math.min(-0.5, ...allVals);
  const maxVal = Math.max(2.0, ...allVals);

  const getX = (year: number) =>
    padding.left + ((year - minYear) / (maxYear - minYear || 1)) * chartW;
  const getY = (val: number) =>
    padding.top + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;

  const pointsA = seriesA.map((d) => `${getX(d.year)},${getY(d.value)}`);
  const pointsB = seriesB.map((d) => `${getX(d.year)},${getY(d.value)}`);

  return (
    <div className="space-y-6 pb-16">
      {/* Header matching reference */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Compare Countries
        </h1>
        <p className="text-xs text-slate-400">
          Compare climate indicators between countries or regions.
        </p>
      </div>

      <div className="rounded-3xl bg-surface-1 border border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Country Selectors: India vs United States + Compare Button matching reference */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Country A */}
          <div className="relative min-w-[180px]">
            <select
              value={regionAId}
              onChange={(e) => setRegionAId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none appearance-none cursor-pointer pr-8 font-mono"
            >
              {REGIONS_DATA.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            vs
          </span>

          {/* Country B */}
          <div className="relative min-w-[180px]">
            <select
              value={regionBId}
              onChange={(e) => setRegionBId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none appearance-none cursor-pointer pr-8 font-mono"
            >
              {REGIONS_DATA.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          <button className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20">
            Compare
          </button>
        </div>

        {/* Indicator Tabs matching reference: Temperature, CO2 Emissions, Sea Level, Rainfall, Forest Cover */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              'Temperature',
              'CO₂ Emissions',
              'Sea Level',
              'Rainfall',
              'Forest Cover',
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTab === tab
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Comparison Chart matching reference */}
        <div className="rounded-2xl bg-surface-0 border border-slate-900 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Average Temperature Change</span>
            <div className="flex items-center gap-4 text-xs font-semibold font-mono">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                {regionA.name}
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                {regionB.name}
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible font-mono"
            >
              {/* Gridlines */}
              {[-0.5, 0.0, 0.5, 1.0, 1.5, 2.0].map((yVal) => {
                const y = getY(yVal);
                return (
                  <g key={`y-${yVal}`}>
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
                      fontSize="10"
                    >
                      {yVal.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* X Axis years */}
              {[1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020].map((yr) => (
                <text
                  key={`x-${yr}`}
                  x={getX(yr)}
                  y={svgHeight - padding.bottom + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {yr}
                </text>
              ))}

              {/* Curve A (India - Orange) */}
              <path
                d={`M ${pointsA.join(' L ')}`}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Curve B (United States - Cyan) */}
              <path
                d={`M ${pointsB.join(' L ')}`}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Country KPI Comparison Cards matching reference exactly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: India */}
          <div className="p-5 rounded-2xl bg-surface-2 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <h3 className="text-sm font-bold text-white">{regionA.name}</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base font-extrabold text-orange-400 block">
                  +1.12°C
                </span>
                <span className="text-[10px] text-slate-400 font-sans block pt-0.5">
                  Temperature Change
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base font-extrabold text-white block">
                  2.1 ppm
                </span>
                <span className="text-[10px] text-slate-400 font-sans block pt-0.5">
                  CO₂ Change
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base font-extrabold text-emerald-400 block">
                  +4.2%
                </span>
                <span className="text-[10px] text-slate-400 font-sans block pt-0.5">
                  Rainfall Change
                </span>
              </div>
            </div>
          </div>

          {/* Card B: United States */}
          <div className="p-5 rounded-2xl bg-surface-2 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold text-white">{regionB.name}</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base font-extrabold text-cyan-400 block">
                  +1.35°C
                </span>
                <span className="text-[10px] text-slate-400 font-sans block pt-0.5">
                  Temperature Change
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base font-extrabold text-white block">
                  5.0 ppm
                </span>
                <span className="text-[10px] text-slate-400 font-sans block pt-0.5">
                  CO₂ Change
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base font-extrabold text-orange-400 block">
                  -2.1%
                </span>
                <span className="text-[10px] text-slate-400 font-sans block pt-0.5">
                  Rainfall Change
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
