import React, { useState } from 'react';
import { PageId } from '../types/climate';
import { useSettings } from '../settings';
import {
  Search,
  Clock,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  Leaf,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  selectedBaseline: string;
  onChangeBaseline: (baseline: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
  selectedBaseline,
  onChangeBaseline,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings, resolvedTheme, update } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState('2020 - 2025');

  const navItems = [
    { id: 'home' as PageId, label: 'Home' },
    { id: 'map' as PageId, label: 'World Map' },
    { id: 'explorer' as PageId, label: 'Data Explorer' },
    { id: 'compare' as PageId, label: 'Compare' },
    { id: 'risks' as PageId, label: 'Climate Risks' },
    { id: 'climate-ai' as PageId, label: 'Climate AI' },
    { id: 'globe' as PageId, label: '3D Earth' },
    { id: 'weather' as PageId, label: 'Weather & Forecast' },
    { id: 'live-map' as PageId, label: 'Live Climate Map' },
    { id: 'analytics' as PageId, label: 'Climate Analytics' },
    { id: 'news' as PageId, label: 'Climate News' },
    { id: 'ai-insights' as PageId, label: 'AI Insights' },
    { id: 'articles' as PageId, label: 'Articles' },
    { id: 'about' as PageId, label: 'About' },
    { id: 'settings' as PageId, label: 'Settings' },
  ];

  const handleMobileNav = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-surface-1/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Top Header Brand Logo -> Home Navigation */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2.5 shrink-0 focus:outline-none group text-left cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        title="Go to ClimateLens Home"
        aria-label="ClimateLens Home"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0">
          <Leaf className="w-4 h-4 fill-slate-950 text-slate-950" />
        </div>
        <span className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center">
          Climate<span className="text-emerald-400">Lens</span>
        </span>
      </button>

      {/* Center/Left: Wide Search Input Pill matching reference */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-xs text-slate-400 border border-slate-800 hover:border-slate-700 transition-all text-left group shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span className="text-slate-400">Search country, region or indicator...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700/60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls matching reference exactly */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Year Range Dropdown Pill matching reference */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1 font-mono"
          >
            <option value="2020 - 2025" className="bg-slate-900 text-slate-200">
              2020 - 2025
            </option>
            <option value="2010 - 2020" className="bg-slate-900 text-slate-200">
              2010 - 2020
            </option>
            <option value="2000 - 2010" className="bg-slate-900 text-slate-200">
              2000 - 2010
            </option>
            <option value="1980 - 2000" className="bg-slate-900 text-slate-200">
              1980 - 2000
            </option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>

        {/* Globe icon control matching reference */}
        <button
          onClick={() => onNavigate('map')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl border border-slate-800/80 transition-colors"
          title="World Map Mode"
        >
          <Globe className="w-4 h-4" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => update({ theme: resolvedTheme === 'light' ? 'dark' : 'light' })}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl border border-slate-800/80 transition-colors"
          title={resolvedTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          aria-label="Toggle light and dark theme"
        >
          {resolvedTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Sign In button matching reference: Green filled pill button */}
        <button
          onClick={onOpenAuth}
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
        >
          Sign in
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-surface-1/98 border-b border-slate-800 p-5 space-y-3 z-50 shadow-2xl backdrop-blur-2xl">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Navigation Modules
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNav(item.id)}
                  className={`flex items-center justify-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
