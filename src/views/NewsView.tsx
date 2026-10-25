import React, { useEffect, useState } from 'react';
import { getJson } from '../services/api';
import { Loader2, AlertCircle, ExternalLink, RefreshCw, Newspaper } from 'lucide-react';

interface Article { title: string; url: string; publisher: string; country: string; publishedAt: string | null; image: string | null }

const TOPICS = ['Climate change', 'Extreme weather', 'Wildfires', 'Renewable energy', 'Sea level & oceans', 'Policy & science'];
const COUNTRIES = ['', 'India', 'United States', 'United Kingdom', 'Australia', 'Canada', 'Brazil'];
const DAYS = [{ v: 1, l: 'Last 24 hours' }, { v: 3, l: 'Last 3 days' }, { v: 7, l: 'Last 7 days' }, { v: 30, l: 'Last 30 days' }];

const Select: React.FC<{ label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }> = ({ label, value, onChange, children }) => (
  <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
    {label}
    <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 rounded-xl bg-surface-1 border border-slate-700 text-xs normal-case tracking-normal font-medium text-slate-200 focus:outline-none focus:border-emerald-500">
      {children}
    </select>
  </label>
);

export const NewsView: React.FC = () => {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [country, setCountry] = useState('');
  const [days, setDays] = useState('7');
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    const q = new URLSearchParams({ topic, country, days });
    getJson<{ articles: Article[] }>(`/api/news?${q}`)
      .then((d) => setArticles(d.articles))
      .catch((e) => { setArticles(null); setError(e.message); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [topic, country, days]);

  return (
    <div className="max-w-4xl space-y-5 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2"><Newspaper className="w-6 h-6 text-emerald-400" />Climate News</h1>
        <p className="text-xs text-slate-400">Recent English-language articles from the GDELT news index. Headlines link to the original publishers.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Select label="Topic" value={topic} onChange={setTopic}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select label="Publisher country" value={country} onChange={setCountry}>{COUNTRIES.map((c) => <option key={c} value={c}>{c || 'All countries'}</option>)}</Select>
        <Select label="Date" value={days} onChange={setDays}>{DAYS.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}</Select>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-1 border border-slate-800 text-slate-300 hover:border-emerald-500/50"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
      </div>

      {loading && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin text-emerald-400" />Loading articles…</div>}
      {error && <div className="flex items-start gap-2 text-xs text-red-400"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
      {!loading && articles && articles.length === 0 && <div className="text-xs text-slate-400">No articles found for this filter. Try a longer date range.</div>}

      <div className="grid sm:grid-cols-2 gap-4">
        {!loading && articles?.map((a) => (
          <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="group rounded-2xl bg-surface-1 border border-slate-800 hover:border-emerald-500/50 overflow-hidden flex flex-col transition-colors">
            {a.image && <img src={a.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={(e) => ((e.currentTarget.style.display = 'none'))} className="h-36 w-full object-cover" />}
            <div className="p-4 flex-1 flex flex-col gap-2">
              <h2 className="text-sm font-bold text-white leading-snug group-hover:text-emerald-400">{a.title}</h2>
              <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400">
                <span>{a.publisher}{a.country ? ` · ${a.country}` : ''}{a.publishedAt ? ` · ${new Date(a.publishedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[11px] text-slate-400">Source: GDELT Project. Articles are machine-indexed and not reviewed by ClimateLens; summaries are not shown to avoid misquoting.</p>
    </div>
  );
};
