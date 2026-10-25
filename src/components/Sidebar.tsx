import React from 'react';
import { PageId } from '../types/climate';
import {
  Home,
  Globe2,
  SlidersHorizontal,
  GitCompare,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Info,
  ChevronLeft,
  ChevronRight,
  Leaf,
  MessageCircle,
  CloudSun,
  Globe,
  Layers,
  LineChart,
  Newspaper,
  Settings as SettingsIcon,
} from 'lucide-react';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'home' as PageId, label: 'Home', icon: Home },
    { id: 'map' as PageId, label: 'World Map', icon: Globe2 },
    { id: 'explorer' as PageId, label: 'Data Explorer', icon: SlidersHorizontal },
    { id: 'compare' as PageId, label: 'Compare', icon: GitCompare },
    { id: 'risks' as PageId, label: 'Climate Risks', icon: AlertTriangle },
    { id: 'climate-ai' as PageId, label: 'Climate AI', icon: MessageCircle },
    { id: 'globe' as PageId, label: '3D Earth', icon: Globe },
    { id: 'weather' as PageId, label: 'Weather & Forecast', icon: CloudSun },
    { id: 'live-map' as PageId, label: 'Live Climate Map', icon: Layers },
    { id: 'analytics' as PageId, label: 'Climate Analytics', icon: LineChart },
    { id: 'news' as PageId, label: 'Climate News', icon: Newspaper },
    { id: 'ai-insights' as PageId, label: 'AI Insights', icon: Sparkles },
    { id: 'articles' as PageId, label: 'Articles', icon: BookOpen },
    { id: 'about' as PageId, label: 'About', icon: Info },
    { id: 'settings' as PageId, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-slate-800/80 bg-surface-1 transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Brand Header matching reference exactly */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/60">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          {/* Green Leaf Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0">
            <Leaf className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight flex items-center">
                Climate<span className="text-emerald-400">Lens</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                Climate Change Data Platform
              </span>
            </div>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List matching reference */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 font-medium'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Status at Bottom */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Observatory v2.6
            </span>
            <span>2020–2025</span>
          </div>
        </div>
      )}
    </aside>
  );
};
