import React, { useState, useEffect, useRef } from 'react';
import { PageId, ClimateIndicatorId, ClimateArticle } from '../types/climate';
import { EarthGlobe } from '../components/EarthGlobe';
import {
  Thermometer,
  CloudRain,
  Waves,
  Snowflake,
  Play,
  Pause,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Globe2,
  LineChart,
  GitCompare,
  AlertTriangle,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Droplets,
  Sun,
  Send,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: PageId) => void;
  onSelectIndicator: (ind: ClimateIndicatorId) => void;
  onSelectArticle: (article: ClimateArticle) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectIndicator,
}) => {
  const [timelineYear, setTimelineYear] = useState<number>(2025);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('Global Temperature');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const timelineYears = [1980, 1990, 2000, 2010, 2020, 2025];

  // Play/pause scrubber
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimelineYear((prev) => {
          const nextIndex = (timelineYears.indexOf(prev) + 1) % timelineYears.length;
          return timelineYears[nextIndex];
        });
      }, 1800);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="space-y-10 pb-16">
      {/* ========================================================================= */}
      {/* HERO SECTION — EXACT LAYOUT MATCHING REFERENCE */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl bg-surface-1 border border-slate-800/90 p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden min-h-[580px] flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* LEFT COLUMN: Headline, copy, buttons & 4 integrated KPI cards */}
          <div className="lg:col-span-6 space-y-6">
            {/* Small pill badge matching reference */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>A DATA-DRIVEN PLANET</span>
            </div>

            {/* Main Headline matching reference */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.1]">
              Understanding a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-[#00f2fe]">
                Changing Planet
              </span>
            </h1>

            {/* Description matching reference */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              Explore real-world climate data, visualize changes across the globe, and discover insights for a sustainable future.
            </p>

            {/* Buttons matching reference */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('map')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('explorer')}
                className="px-6 py-3 rounded-xl bg-surface-2 hover:bg-surface-2 text-slate-200 border border-slate-700 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                View Data
              </button>
            </div>

            {/* 4 Large Climate KPI Cards Integrated Underneath Headline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              {/* Card 1: Global Temperature */}
              <div
                onClick={() => {
                  onSelectIndicator('temperature');
                  onNavigate('explorer');
                }}
                className="p-3.5 rounded-2xl bg-surface-2 border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer group space-y-1.5"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-tight block">
                  Global Temperature
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  +1.24°C
                </div>
                <div className="text-[11px] font-bold text-orange-400 flex items-center gap-1 font-mono">
                  <span>↑ 0.18°C/decade</span>
                </div>
              </div>

              {/* Card 2: CO2 Concentration */}
              <div
                onClick={() => {
                  onSelectIndicator('co2');
                  onNavigate('explorer');
                }}
                className="p-3.5 rounded-2xl bg-surface-2 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group space-y-1.5"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <CloudRain className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-tight block">
                  CO₂ Concentration
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  423 ppm
                </div>
                <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 font-mono">
                  <span>↑ 2.4 ppm/year</span>
                </div>
              </div>

              {/* Card 3: Sea Level Rise */}
              <div
                onClick={() => {
                  onSelectIndicator('sea_level');
                  onNavigate('explorer');
                }}
                className="p-3.5 rounded-2xl bg-surface-2 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group space-y-1.5"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Waves className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-tight block">
                  Sea Level Rise
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  +102 mm
                </div>
                <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1 font-mono">
                  <span>↑ 3.4 mm/year</span>
                </div>
              </div>

              {/* Card 4: Arctic Ice Extent */}
              <div
                onClick={() => {
                  onSelectIndicator('arctic_ice');
                  onNavigate('explorer');
                }}
                className="p-3.5 rounded-2xl bg-surface-2 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group space-y-1.5"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <Snowflake className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-tight block">
                  Arctic Ice Extent
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  -13%
                </div>
                <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1 font-mono">
                  <span>↓ vs. 1980s</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Huge 3D Earth, Floating Selector & Temperature Bar */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[460px] lg:min-h-[520px]">
            {/* Floating Indicator Selector matching reference */}
            <div className="absolute top-2 right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-xl">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              <span>{selectedIndicator}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Vertical Temperature Legend matching reference */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-900/80 border border-slate-800/80 p-2 rounded-xl backdrop-blur-md shadow-lg">
              <span className="text-xs font-bold text-slate-400 pb-1">°C</span>
              <span className="text-red-400 font-bold">&gt; 4</span>
              <div className="w-2.5 h-20 rounded-full bg-gradient-to-b from-red-500 via-orange-400 via-yellow-400 via-green-400 to-cyan-500 my-0.5 shadow-inner" />
              <span className="text-orange-400">2</span>
              <span className="text-emerald-400">0</span>
              <span className="text-cyan-400">-2</span>
              <span className="text-blue-500 font-bold">&lt;-4</span>
            </div>

            {/* 3D WebGL Realistic Interactive Earth Globe */}
            <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] flex items-center justify-center">
              <EarthGlobe year={timelineYear} indicator={selectedIndicator} />
            </div>

            {/* Draggable Bottom Timeline Bar matching reference */}
            <div className="w-full max-w-md mx-auto z-20 flex items-center gap-4 bg-slate-900/90 border border-slate-800/80 px-4 py-2 rounded-full backdrop-blur-md shadow-2xl mt-[-20px]">
              {/* Play / Pause circular button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 transition-transform active:scale-95"
                title={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Scrubber track & milestones */}
              <div className="flex-1 flex items-center justify-between text-xs font-mono text-slate-400 relative">
                {timelineYears.map((yr) => {
                  const isCurrent = timelineYear === yr;
                  return (
                    <button
                      key={yr}
                      onClick={() => setTimelineYear(yr)}
                      className={`relative z-10 flex flex-col items-center gap-1 transition-all ${
                        isCurrent ? 'text-emerald-400 font-bold scale-105' : 'hover:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                          isCurrent
                            ? 'bg-emerald-400 border-white shadow-sm shadow-emerald-400'
                            : 'bg-slate-800 border-slate-600'
                        }`}
                      />
                      <span className="text-[11px]">{yr}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECONDARY DASHBOARDS — MATCHING THE LOWER TILES IN REFERENCE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tile 1: Interactive World Map Preview */}
        <div
          onClick={() => onNavigate('map')}
          className="rounded-3xl bg-surface-1 border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 transition-all cursor-pointer shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Interactive World Map
              </h3>
              <Globe2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              Visualize climate data across the globe with multiple indicators.
            </p>

            {/* Stylized world map preview graphic */}
            <div className="w-full aspect-[16/9] rounded-xl bg-surface-0 border border-slate-900 relative overflow-hidden flex items-center justify-center p-2">
              <div className="w-full h-full rounded-lg bg-gradient-to-r from-blue-900/60 via-amber-800/60 to-red-800/60 flex items-center justify-center relative">
                <span className="text-xs font-mono font-semibold text-slate-200 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                  Thermal Anomaly Grid · 2026
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Explore Full Map Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tile 2: Global Temperature Trend Chart Preview */}
        <div
          onClick={() => onNavigate('explorer')}
          className="rounded-3xl bg-surface-1 border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 transition-all cursor-pointer shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Global Temperature Trend
              </h3>
              <LineChart className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              Change in average surface temperature (1880 – 2025).
            </p>

            {/* Stylized trend line */}
            <div className="w-full aspect-[16/9] rounded-xl bg-surface-0 border border-slate-900 p-3 flex flex-col justify-end">
              <svg viewBox="0 0 100 40" className="w-full h-24 overflow-visible">
                <path
                  d="M 5,32 Q 25,30 45,26 T 75,15 T 95,6"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="95" cy="6" r="3" fill="#f97316" />
              </svg>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>1880 (-0.16°C)</span>
                <span className="text-orange-400 font-bold">2026 (+1.24°C)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-orange-400 font-semibold">
            <span>Open Trend Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tile 3: Compare Countries Preview */}
        <div
          onClick={() => onNavigate('compare')}
          className="rounded-3xl bg-surface-1 border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 transition-all cursor-pointer shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Compare Countries
              </h3>
              <GitCompare className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              Benchmark regional emissions and temperature differentials.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div className="p-3 rounded-xl bg-surface-2 border border-slate-800">
                <span className="text-white font-bold block">India 🇮🇳</span>
                <span className="text-emerald-400 text-sm font-semibold">+1.12°C</span>
                <span className="text-[10px] text-slate-400 block pt-1">CO₂: 2.1 ppm</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-2 border border-slate-800">
                <span className="text-white font-bold block">United States 🇺🇸</span>
                <span className="text-cyan-400 text-sm font-semibold">+1.35°C</span>
                <span className="text-[10px] text-slate-400 block pt-1">CO₂: 5.0 ppm</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span>Compare Any Regions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tile 4: Climate Risk Index Preview */}
        <div
          onClick={() => onNavigate('risks')}
          className="rounded-3xl bg-surface-1 border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 transition-all cursor-pointer shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Climate Risk Index
              </h3>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              Explore climate-related risks and vulnerabilities by region.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Heat Risk
                </span>
                <span className="font-mono text-orange-400 font-bold">82%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-[82%] h-full bg-orange-500 rounded-full" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Flood Risk
                </span>
                <span className="font-mono text-cyan-400 font-bold">64%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-[64%] h-full bg-cyan-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Overall Risk: 7.4 / 10</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tile 5: AI Climate Insights Preview */}
        <div
          onClick={() => onNavigate('ai-insights')}
          className="rounded-3xl bg-surface-1 border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 transition-all cursor-pointer shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                AI Climate Insights
              </h3>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              Ask questions about climate data and get instant insights.
            </p>

            <div className="p-3 rounded-xl bg-surface-2 border border-slate-800 text-xs space-y-1.5">
              <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold block">
                Sample Query:
              </span>
              <p className="text-slate-200 font-medium">
                &quot;Why is global temperature increasing?&quot;
              </p>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                Global temperature has risen due to anthropogenic greenhouse gas accumulation and ocean heat uptake.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Ask Natural Language AI</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tile 6: Data Explorer Preview */}
        <div
          onClick={() => onNavigate('explorer')}
          className="rounded-3xl bg-surface-1 border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 transition-all cursor-pointer shadow-xl flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Data Explorer & CSV
              </h3>
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              Access and export raw climate datasets from trusted sources.
            </p>

            <div className="p-3 rounded-xl bg-surface-2 border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Variable:</span>
                <span className="text-slate-200">CO₂ Concentration</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Source:</span>
                <span className="text-emerald-400">NASA GISS / NOAA</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Format:</span>
                <span className="text-cyan-400">RFC CSV Downloadable</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Open Data Explorer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
