import React from 'react';
import { ClimateArticle } from '../types/climate';
import { X, Calendar, Clock, User, Share2, Bookmark, Check } from 'lucide-react';

interface ArticleModalProps {
  article: ClimateArticle | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!article) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-2xl bg-surface-1 border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category & Metadata header */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
          <span className="font-mono text-emerald-400 font-semibold">{article.category}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {article.date}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {article.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight mb-4">
          {article.title}
        </h1>

        {/* Author */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>{article.author}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors border border-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Featured Key Metric Callout */}
        <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-cyan-950/20 border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
              Core Planetary Benchmark
            </span>
            <div className="text-sm font-semibold text-slate-200">{article.dataMetric.label}</div>
          </div>
          <div className="sm:text-right font-mono">
            <div className="text-2xl font-extrabold text-white">{article.dataMetric.value}</div>
            <div className="text-xs text-cyan-300">{article.dataMetric.trend}</div>
          </div>
        </div>

        {/* Article Body Prose */}
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-normal">
          {article.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Key Takeaway Box */}
        <div className="my-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">
            Key Takeaway
          </span>
          <p className="text-slate-200 font-medium leading-relaxed">{article.keyTakeaway}</p>
        </div>

        {/* Citations and Sources */}
        <div className="pt-6 border-t border-slate-800 space-y-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300 block">Scientific Sources & Citations:</span>
          <ul className="list-disc list-inside space-y-1 text-[11px] font-mono">
            {article.sources.map((src, i) => (
              <li key={i}>{src}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
