import React, { useState } from 'react';
import { AiInsightResponse } from '../types/climate';
import { queryClimateAi } from '../services/climateService';
import { Sparkles, Loader2, Send } from 'lucide-react';

export const AiInsightsView: React.FC = () => {
  const [query, setQuery] = useState('Why is global temperature increasing?');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<AiInsightResponse>({
    source: 'gemini-3.8-flash',
    summary:
      'Global temperature has been increasing due to a combination of human activities and natural factors.',
    causes: [
      'Increased greenhouse gas emissions (CO₂, CH₄, N₂O)',
      'Deforestation and land use changes',
      'Industrial and transportation activities',
    ],
    impacts: [
      'More frequent extreme weather events',
      'Rising sea levels',
      'Changes in agricultural productivity',
    ],
    interpretation:
      'The global average temperature has increased by about 1.24°C since pre-industrial times, and the rate of warming has accelerated since 1970.',
    keyTakeaway:
      'Limiting future warming requires rapid, sustained reductions in greenhouse gas emissions across all sectors.',
    uncertaintyNote:
      'Observed instrumental records carry minimal uncertainty (±0.05°C); regional precipitation and extreme weather projections reflect scenario variance.',
  });

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await queryClimateAi(query, 'temperature', 'Global', 2026);
      setInsight(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header matching reference */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Climate Insights
        </h1>
        <p className="text-xs text-slate-400">
          Ask questions about climate data and get instant insights.
        </p>
      </div>

      <div className="rounded-3xl bg-surface-1 border border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Input Bar with Green Ask AI button matching reference */}
        <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about climate data..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-sans"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ask AI</span>
              </>
            )}
          </button>
        </form>

        {/* Structured AI Insight Card matching reference exactly */}
        <div className="rounded-2xl bg-surface-0 border border-slate-900 p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
            {/* Avatar / AI Sparkle icon in purple/cyan ring matching reference */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5 shrink-0 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Headline Summary matching reference */}
            <h2 className="text-sm sm:text-base font-bold text-white leading-relaxed pt-1">
              {insight.summary}
            </h2>
          </div>

          <div className="space-y-4 pl-0 sm:pl-13 text-xs">
            {/* Main causes matching reference */}
            <div className="space-y-2">
              <span className="font-bold text-slate-200 block text-xs">Main causes:</span>
              <ul className="space-y-1.5 text-slate-300">
                {insight.causes.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">◆</span>
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Observed impacts matching reference */}
            <div className="space-y-2 pt-1">
              <span className="font-bold text-slate-200 block text-xs">Observed impacts:</span>
              <ul className="space-y-1.5 text-slate-300">
                {insight.impacts.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">◆</span>
                    <span className="leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data insight matching reference */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <span className="font-bold text-slate-200 block text-xs">Data insight:</span>
              <p className="text-slate-300 leading-relaxed text-xs">
                {insight.interpretation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
