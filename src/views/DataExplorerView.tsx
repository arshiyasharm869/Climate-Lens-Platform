import React, { useState, useMemo } from 'react';
import { ClimateIndicatorId } from '../types/climate';
import { INDICATOR_METAS, REGIONS_DATA, getRegionById } from '../data/climateData';
import { getSeriesData, downloadDatasetCsv } from '../services/climateService';
import {
  Download,
  GitCompare,
  RotateCcw,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DataExplorerViewProps {
  initialIndicator?: ClimateIndicatorId;
  onNavigateToCompare?: (regionA: string, regionB: string) => void;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'trend' | 'explorer'>('trend');
  const [timeFilter, setTimeFilter] = useState<'All' | '50Y' | '30Y' | '10Y'>('All');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('global');

  // Explorer specific state
  const [explorerDataset, setExplorerDataset] = useState<ClimateIndicatorId>('co2');
  const [explorerRegion, setExplorerRegion] = useState<string>('global');
  const [explorerPeriod, setExplorerPeriod] = useState<string>('1980 - 2025');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ year: number; value: number } | null>(null);

  // Time filter calculation for trend view
  const startYear = useMemo(() => {
    if (timeFilter === '10Y') return 2015;
    if (timeFilter === '30Y') return 1995;
    if (timeFilter === '50Y') return 1975;
    return 1880;
  }, [timeFilter]);

  const globalTempData = useMemo(() => {
    return getSeriesData('temperature', selectedRegionId, startYear, 2026);
  }, [selectedRegionId, startYear]);

  const co2Data = useMemo(() => getSeriesData('co2', 'global', 1980, 2026), []);
  const seaLevelData = useMemo(() => getSeriesData('sea_level', 'global', 1980, 2026), []);
  const arcticIceData = useMemo(() => getSeriesData('arctic_ice', 'global', 1990, 2026), []);

  const explorerData = useMemo(() => {
    return getSeriesData(explorerDataset, explorerRegion, 1980, 2026);
  }, [explorerDataset, explorerRegion]);

  const handleDownloadCsv = () => {
    const success = downloadDatasetCsv(explorerDataset, explorerRegion, 1980, 2026);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }
  };

  // SVG Chart calculation for large Global Temperature Trend chart
  const minVal = -0.5;
  const maxVal = 1.5;
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const minYear = globalTempData[0]?.year || 1880;
  const maxYear = globalTempData[globalTempData.length - 1]?.year || 2026;

  const getX = (year: number) => {
    return padding.left + ((year - minYear) / (maxYear - minYear || 1)) * chartW;
  };
  const getY = (val: number) => {
    return padding.top + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;
  };

  const points = globalTempData.map((d) => `${getX(d.year)},${getY(d.value)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M ${getX(minYear)},${padding.top + chartH} L ${points.join(' L ')} L ${getX(
    maxYear
  )},${padding.top + chartH} Z`;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Segmented Tab Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('trend')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'trend'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Temperature Trend Dashboard
        </button>
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'explorer'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dataset Explorer & CSV
        </button>
      </div>

      {activeTab === 'trend' ? (
        /* ========================================================================= */
        /* VIEW 1: GLOBAL TEMPERATURE TREND (MATCHING REFERENCE MIDDLE-TOP PANEL) */
        /* ========================================================================= */
        <div className="rounded-3xl bg-surface-1 border border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header & Controls matching reference */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Global Temperature Trend
              </h1>
              <p className="text-xs text-slate-400">
                Change in average surface temperature (1880 – 2025)
              </p>
            </div>

            {/* Controls: Region Selector + Time range buttons matching reference */}
            <div className="flex items-center gap-3">
              {/* Region dropdown */}
              <div className="relative">
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none appearance-none cursor-pointer pr-7 font-mono"
                >
                  <option value="global">Global</option>
                  <option value="in">India</option>
                  <option value="us">United States</option>
                  <option value="cn">China</option>
                  <option value="de">Germany</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Time filter buttons matching reference (All, 50Y, 30Y, 10Y) */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                {(['All', '50Y', '30Y', '10Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFilter(period)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      timeFilter === period
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Large Main Line Chart matching reference */}
          <div className="relative w-full rounded-2xl bg-surface-0 border border-slate-900 p-4 select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible font-mono"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="temp-glow-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis gridlines & labels (-0.5 to 1.5) */}
              {[-0.5, 0.0, 0.5, 1.0, 1.5].map((yVal) => {
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
              {[1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020].map((yr) => {
                if (yr < minYear || yr > maxYear) return null;
                const x = getX(yr);
                return (
                  <g key={`x-${yr}`}>
                    <text
                      x={x}
                      y={svgHeight - padding.bottom + 18}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                    >
                      {yr}
                    </text>
                  </g>
                );
              })}

              {/* Area gradient fill under orange curve */}
              <path d={areaPath} fill="url(#temp-glow-area)" />

              {/* Main glowing temperature line */}
              <path
                d={linePath}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Transparent hover capture rects */}
              {globalTempData.map((pt) => (
                <rect
                  key={`hover-${pt.year}`}
                  x={getX(pt.year) - 4}
                  y={padding.top}
                  width={8}
                  height={chartH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredPoint(pt)}
                />
              ))}

              {/* Hover Dot */}
              {hoveredPoint && (
                <g>
                  <circle
                    cx={getX(hoveredPoint.year)}
                    cy={getY(hoveredPoint.value)}
                    r="5"
                    fill="#040813"
                    stroke="#f97316"
                    strokeWidth="2.5"
                  />
                  <line
                    x1={getX(hoveredPoint.year)}
                    y1={padding.top}
                    x2={getX(hoveredPoint.year)}
                    y2={padding.top + chartH}
                    stroke="#38bdf8"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                </g>
              )}
            </svg>

            {/* Hover tooltip */}
            {hoveredPoint && (
              <div
                className="absolute top-4 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-xl text-xs font-mono space-y-0.5"
                style={{
                  left: `${(getX(hoveredPoint.year) / svgWidth) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="text-slate-400 text-[10px]">Year {hoveredPoint.year}</div>
                <div className="text-orange-400 font-bold text-sm">
                  {hoveredPoint.value > 0 ? `+${hoveredPoint.value}°C` : `${hoveredPoint.value}°C`}
                </div>
              </div>
            )}
          </div>

          {/* 3 Supporting Cards with Mini Sparklines matching reference exactly */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Card 1: CO2 Concentration */}
            <div className="p-4 rounded-2xl bg-surface-2 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                CO₂ Concentration
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                423 ppm
              </div>
              {/* Mini area sparkline */}
              <div className="w-full h-16 pt-1">
                <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                  <path
                    d="M 5,28 Q 35,26 65,18 T 95,5"
                    fill="none"
                    stroke="#00e676"
                    strokeWidth="2"
                  />
                  <path
                    d="M 5,28 Q 35,26 65,18 T 95,5 L 95,30 L 5,30 Z"
                    fill="#00e676"
                    opacity="0.15"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                <span>1980 (338 ppm)</span>
                <span>2000</span>
                <span className="text-emerald-400">2026</span>
              </div>
            </div>

            {/* Card 2: Sea Level Rise */}
            <div className="p-4 rounded-2xl bg-surface-2 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Sea Level Rise
              </span>
              <div className="text-2xl font-extrabold text-[#38bdf8] font-mono">
                +102 mm
              </div>
              {/* Mini area sparkline */}
              <div className="w-full h-16 pt-1">
                <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                  <path
                    d="M 5,28 Q 40,24 70,14 T 95,4"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <path
                    d="M 5,28 Q 40,24 70,14 T 95,4 L 95,30 L 5,30 Z"
                    fill="#38bdf8"
                    opacity="0.15"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                <span>1980</span>
                <span>2000</span>
                <span className="text-cyan-400">2026 (+102 mm)</span>
              </div>
            </div>

            {/* Card 3: Arctic Ice Extent */}
            <div className="p-4 rounded-2xl bg-surface-2 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Arctic Ice Extent
              </span>
              <div className="text-2xl font-extrabold text-[#c084fc] font-mono">
                -13%
              </div>
              {/* Mini area sparkline */}
              <div className="w-full h-16 pt-1">
                <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                  <path
                    d="M 5,6 Q 35,10 65,18 T 95,26"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2"
                  />
                  <path
                    d="M 5,6 Q 35,10 65,18 T 95,26 L 95,30 L 5,30 Z"
                    fill="#c084fc"
                    opacity="0.15"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                <span>1990</span>
                <span>2000</span>
                <span className="text-purple-400">2026 (-13%)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: DATA EXPLORER & CSV (MATCHING REFERENCE BOTTOM-RIGHT-2 PANEL) */
        /* ========================================================================= */
        <div className="rounded-3xl bg-surface-1 border border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header matching reference */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Data Explorer
            </h1>
            <p className="text-xs text-slate-400">
              Access and visualize climate datasets from trusted sources.
            </p>
          </div>

          {/* Filter Bar matching reference: Dataset, Region, Time Period, Load Data button */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Dataset</label>
              <div className="relative">
                <select
                  value={explorerDataset}
                  onChange={(e) => setExplorerDataset(e.target.value as ClimateIndicatorId)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none appearance-none cursor-pointer pr-7 font-mono"
                >
                  <option value="co2">CO₂ Concentration</option>
                  <option value="temperature">Surface Temperature</option>
                  <option value="sea_level">Sea Level Rise</option>
                  <option value="precipitation">Precipitation Anomaly</option>
                  <option value="arctic_ice">Arctic Ice Extent</option>
                  <option value="forest_cover">Forest Cover</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Region</label>
              <div className="relative">
                <select
                  value={explorerRegion}
                  onChange={(e) => setExplorerRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none appearance-none cursor-pointer pr-7 font-mono"
                >
                  <option value="global">Global</option>
                  <option value="in">India</option>
                  <option value="us">United States</option>
                  <option value="cn">China</option>
                  <option value="de">Germany</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Time Period</label>
              <div className="relative">
                <select
                  value={explorerPeriod}
                  onChange={(e) => setExplorerPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none appearance-none cursor-pointer pr-7 font-mono"
                >
                  <option value="1980 - 2025">1980 - 2025</option>
                  <option value="2000 - 2025">2000 - 2025</option>
                  <option value="1880 - 2025">1880 - 2025</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end">
              <button className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20">
                Load Data
              </button>
            </div>
          </div>

          {/* Visualization & Dataset Info Grid matching reference */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            {/* Left: Chart of selected dataset (lg:col-span-8) */}
            <div className="lg:col-span-8 rounded-2xl bg-surface-0 border border-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span>{INDICATOR_METAS[explorerDataset].name}</span>
                <span className="font-mono text-emerald-400">
                  {INDICATOR_METAS[explorerDataset].unit}
                </span>
              </div>

              {/* Chart SVG */}
              <div className="w-full h-64 flex items-center justify-center">
                <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible font-mono">
                  {/* Grid lines */}
                  {[40, 90, 140, 190].map((y, i) => (
                    <line
                      key={i}
                      x1="40"
                      y1={y}
                      x2="580"
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2 3"
                    />
                  ))}
                  {/* Glowing Green Curve */}
                  <path
                    d="M 50,190 Q 200,180 350,120 T 560,40"
                    fill="none"
                    stroke="#00e676"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50,190 Q 200,180 350,120 T 560,40 L 560,200 L 50,200 Z"
                    fill="#00e676"
                    opacity="0.1"
                  />
                  {/* Axis labels */}
                  <text x="50" y="215" fill="#94a3b8" fontSize="10">
                    1980
                  </text>
                  <text x="220" y="215" fill="#94a3b8" fontSize="10">
                    1990
                  </text>
                  <text x="390" y="215" fill="#94a3b8" fontSize="10">
                    2000
                  </text>
                  <text x="550" y="215" fill="#94a3b8" fontSize="10">
                    2020
                  </text>
                </svg>
              </div>
            </div>

            {/* Right: Dataset Info Table & Download CSV Button (lg:col-span-4) matching reference */}
            <div className="lg:col-span-4 rounded-2xl bg-surface-2 border border-slate-800 p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                Dataset Info
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Source:</span>
                  <span className="text-white font-semibold">NASA GISS / NOAA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Variable:</span>
                  <span className="text-white font-semibold">
                    {INDICATOR_METAS[explorerDataset].shortName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit:</span>
                  <span className="text-emerald-400">
                    {INDICATOR_METAS[explorerDataset].unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Period:</span>
                  <span className="text-white">1980 - 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution:</span>
                  <span className="text-white">Annual</span>
                </div>
              </div>

              {/* Green Download CSV button matching reference */}
              <button
                onClick={handleDownloadCsv}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>CSV Exported!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
