import React from 'react';
import {
  APP_NAME,
  APP_TAGLINE,
  DATA_METHODOLOGY_DISCLAIMER,
} from '../config';
import { ClimateLogo } from '../components/ClimateLogo';
import {
  Target,
  Sparkles,
  Cpu,
  Database,
  Quote,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-4xl mx-auto">
      {/* Hero Brand Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="flex justify-center mb-2">
          <ClimateLogo size={48} showText={false} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About {APP_NAME}
        </h1>
        <p className="text-sm sm:text-base text-emerald-400 font-mono">
          {APP_TAGLINE}
        </p>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
          ClimateLens is a climate-data visualization platform designed to make climate information easier to explore, compare, and understand through interactive visualizations, cartography, and artificial intelligence.
        </p>
      </div>

      {/* 01. Mission */}
      <section className="rounded-2xl bg-surface-1 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-3">
          <Target className="w-5 h-5 text-emerald-400" />
          <h2>Mission & Vision</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Climate change is frequently discussed in abstract figures or dense multi-thousand-page technical reports. ClimateLens bridges the gap between scientific raw data and human intuition. Our mission is to transform complex thermodynamic, oceanic, and atmospheric telemetry into clear, interactive, and actionable visual narratives.
        </p>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          By unifying multidecadal satellite observations, regional vulnerability indexes, and automated natural-language interpretations, ClimateLens equips researchers, policymakers, educators, and citizens with objective planetary insight.
        </p>
      </section>

      {/* 02. Core Platform Capabilities */}
      <section className="rounded-2xl bg-surface-1 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2>Platform Architecture & Features</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Interactive Cartography
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Vector world map with graticule grid lines, timeline animation scrubber (1880–2026), thermal projection styles, and station hover inspection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Time-Series Analytics
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Multi-mode SVG charting engine supporting line, area, and bar representations with interactive zoom, hover crosshairs, and RFC CSV export.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" /> Multi-Country Comparison
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Side-by-side indicator analysis with overlaid historical trends and automated differential statistical calculations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> AI Insights Engine
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Natural-language synthesis backed by Google Gemini 3.8 Flash, categorizing queries into physical causes, observed impacts, and methodology notes.
            </p>
          </div>
        </div>
      </section>

      {/* 03. Technology Stack */}
      <section className="rounded-2xl bg-surface-1 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h2>Technology Stack</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">Framework</span>
            <span className="font-bold text-slate-200">React 19 & Vite</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">Language</span>
            <span className="font-bold text-slate-200">TypeScript 5</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">Styling</span>
            <span className="font-bold text-slate-200">Tailwind CSS v4</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">AI Integration</span>
            <span className="font-bold text-slate-200">Gemini 3.8 Flash</span>
          </div>
        </div>
      </section>

      {/* 04. Data Methodology & Scientific Sources */}
      <section className="rounded-2xl bg-surface-1 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-slate-800 pb-3">
          <Database className="w-5 h-5 text-cyan-400" />
          <h2>Data Methodology & Integrity</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {DATA_METHODOLOGY_DISCLAIMER}
        </p>

        <div className="space-y-2 pt-1 text-xs text-slate-400">
          <strong className="text-slate-300 block">Future & Benchmark Sources:</strong>
          <ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
            <li>NASA Goddard Institute for Space Studies (GISTEMP v4)</li>
            <li>NOAA Global Monitoring Laboratory (Atmospheric CO₂ dry air fraction)</li>
            <li>Copernicus Climate Change Service / ECMWF (ERA5 Reanalysis)</li>
            <li>Intergovernmental Panel on Climate Change (IPCC Sixth Assessment Report)</li>
            <li>National Snow and Ice Data Center (NSIDC Sea Ice Index)</li>
          </ul>
        </div>
      </section>

      {/* Closing Vision Statement */}
      <section className="relative rounded-2xl bg-gradient-to-r from-surface-1 via-surface-1 to-surface-1 border border-emerald-500/30 p-6 sm:p-9 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Subtle decorative ambient glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/5">
            <Quote className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
          </div>
          <blockquote className="flex-1">
            <p className="text-base sm:text-lg md:text-xl text-slate-100 font-medium leading-relaxed tracking-wide">
              “ClimateLens transforms complex planetary climate data into clear, meaningful visual insights—helping us understand how our world is changing and why it matters.”
            </p>
          </blockquote>
        </div>
      </section>
    </div>
  );
};
