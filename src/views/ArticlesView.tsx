import React, { useState, useMemo } from 'react';
import { ClimateArticle } from '../types/climate';
import { CLIMATE_ARTICLES } from '../data/articlesData';
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface ArticlesViewProps {
  onSelectArticle: (article: ClimateArticle) => void;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({ onSelectArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Global Warming',
    'Carbon Emissions',
    'Melting Ice',
    'Sea Level Rise',
    'Extreme Weather',
    'Deforestation',
    'Renewable Energy',
  ];

  const filteredArticles = useMemo(() => {
    return CLIMATE_ARTICLES.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Climate Science Journal & Deep Dives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Scientific Articles & Topics
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Authoritative, accessible essays unpacking Earth system tipping elements, emissions budgets, and clean technology dynamics.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search climate essays..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group rounded-2xl bg-surface-1 border border-slate-800/80 hover:border-slate-700 p-6 flex flex-col justify-between space-y-4 cursor-pointer shadow-lg hover:shadow-emerald-950/10 transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Category and Read time (Zero pill discipline: clean text with typographic separator) */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span className="text-emerald-400 font-semibold">{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                {/* Key metric preview box */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {article.dataMetric.label}
                  </span>
                  <span className="font-bold text-emerald-400">
                    {article.dataMetric.value}
                  </span>
                </div>
              </div>

              {/* Card Footer: Read More Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{article.author.split('·')[0]}</span>
                <span className="font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl bg-surface-1 border border-slate-800 p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            No articles found matching &quot;{searchQuery}&quot;
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for other climate topics or select &quot;All&quot; to view every available brief.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
