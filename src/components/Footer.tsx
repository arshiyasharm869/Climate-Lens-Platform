import React from 'react';
import { ClimateLogo } from './ClimateLogo';
import { PageId } from '../types/climate';
import {
  PROJECT_NAME,
  APP_NAME,
  APP_TAGLINE,
  DATA_METHODOLOGY_DISCLAIMER,
} from '../config';
import { Globe, ShieldCheck, Database } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-surface-0 border-t border-slate-800/80 text-slate-400 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <ClimateLogo size={36} />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {APP_TAGLINE}. An advanced scientific climate intelligence platform for exploring historical planetary observations, risk vulnerability indices, and comparative scenarios.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400/90 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Reference Baseline: 1880–2026</span>
            </div>
          </div>

          {/* Core Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('map')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Interactive World Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explorer')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Data Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('compare')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Climate Comparison
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('risks')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Climate Risk Index
                </button>
              </li>
            </ul>
          </div>

          {/* Research & Intelligence */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Intelligence & Science
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('ai-insights')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  AI Climate Insights
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('articles')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Scientific Articles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Data & Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  About ClimateLens
                </button>
              </li>
            </ul>
          </div>

          {/* Data Methodology & Integrity Notice */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Data Architecture</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {DATA_METHODOLOGY_DISCLAIMER}
            </p>
            <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" /> NASA GISS
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> NOAA ESRL
              </span>
              <span>·</span>
              <span>IPCC AR6</span>
            </div>
          </div>
        </div>

        {/* Footer copyright */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-center sm:text-left text-slate-300">
            <span>© 2026 {PROJECT_NAME} · All Rights Reserved</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Model v2026.4</span>
            <span>·</span>
            <span>NASA/NOAA Benchmarks</span>
            <span>·</span>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-emerald-400 transition-colors"
            >
              Citation & Credits
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
