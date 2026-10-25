import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageId, ClimateIndicatorId, RegionData, ClimateArticle } from '../types/climate';
import { INDICATOR_METAS, REGIONS_DATA } from '../data/climateData';
import { CLIMATE_ARTICLES } from '../data/articlesData';
import {
  Search,
  X,
  MapPin,
  Activity,
  FileText,
  Database,
  ArrowRight,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  onSelectIndicator?: (ind: ClimateIndicatorId) => void;
  onSelectRegion?: (regionId: string) => void;
  onSelectArticle?: (article: ClimateArticle) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectIndicator,
  onSelectRegion,
  onSelectArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return { regions: [], indicators: [], articles: [] };

    const regions = REGIONS_DATA.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.code?.toLowerCase().includes(term) ||
        r.risk.keyHazards.some((h) => h.toLowerCase().includes(term))
    ).slice(0, 4);

    const indicators = Object.values(INDICATOR_METAS).filter(
      (ind) =>
        ind.name.toLowerCase().includes(term) ||
        ind.shortName.toLowerCase().includes(term) ||
        ind.description.toLowerCase().includes(term)
    ).slice(0, 4);

    const articles = CLIMATE_ARTICLES.filter(
      (art) =>
        art.title.toLowerCase().includes(term) ||
        art.category.toLowerCase().includes(term) ||
        art.tags.some((t) => t.toLowerCase().includes(term))
    ).slice(0, 4);

    return { regions, indicators, articles };
  }, [searchTerm]);

  if (!isOpen) return null;

  const hasResults =
    searchResults.regions.length > 0 ||
    searchResults.indicators.length > 0 ||
    searchResults.articles.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-surface-1 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-4 h-4 text-emerald-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search countries, climate indicators, datasets, articles..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-mono"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!searchTerm ? (
            <div className="py-6 text-center text-xs text-slate-400 space-y-2">
              <p>Type to search across ClimateLens planetary observation catalog.</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {['India', 'CO2 Level', 'Sea Level', 'Arctic Ice', 'Renewables'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No climate data or articles matching &quot;{searchTerm}&quot;.
            </div>
          ) : (
            <>
              {/* Regions Results */}
              {searchResults.regions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    Countries & Regions
                  </div>
                  {searchResults.regions.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => {
                        if (onSelectRegion) onSelectRegion(reg.id);
                        onNavigate('compare');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 border border-slate-800/60 hover:border-slate-700 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 flex items-center justify-center text-xs font-mono font-bold">
                          {reg.code || 'GL'}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            {reg.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Risk Index: {reg.risk.overallScore} / 10 · {reg.continent || 'Global'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {/* Indicators Results */}
              {searchResults.indicators.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    Climate Indicators & Datasets
                  </div>
                  {searchResults.indicators.map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => {
                        if (onSelectIndicator) onSelectIndicator(ind.id);
                        onNavigate('explorer');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 border border-slate-800/60 hover:border-slate-700 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold"
                          style={{
                            backgroundColor: `${ind.color}15`,
                            color: ind.color,
                            border: `1px solid ${ind.color}35`,
                          }}
                        >
                          {ind.symbol}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            {ind.name}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            Unit: {ind.unit} · {ind.baseline}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {/* Articles Results */}
              {searchResults.articles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-orange-400" />
                    Scientific Articles & Topics
                  </div>
                  {searchResults.articles.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        if (onSelectArticle) onSelectArticle(art);
                        onNavigate('articles');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 border border-slate-800/60 hover:border-slate-700 transition-colors text-left group"
                    >
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-mono text-orange-400">
                          {art.category} · {art.readTime}
                        </div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                          {art.title}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-900/40 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or keyboard</span>
          <span>ClimateLens Global Index</span>
        </div>
      </div>
    </div>
  );
};
