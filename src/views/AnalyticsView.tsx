import React, { useEffect, useState } from 'react';
import { getJson } from '../services/api';
import { SimpleLineChart } from '../components/SimpleLineChart';
import { EmissionsPanel, HistoryPanel } from '../components/AnalyticsExtras';
import { Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface Series { data?: { year: number; value: number }[]; unit?: string; baseline?: string; source?: string; url?: string; error?: string }

const Panel: React.FC<{ title: string; blurb: string; series?: Series; color: string; zero?: boolean; fmt: (n: number) => string }> = ({ title, blurb, series, color, zero, fmt }) => (
  <section className="rounded-3xl bg-surface-1 border border-slate-800 p-5 sm:p-6 space-y-3">
    <div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="text-xs text-slate-400">{blurb}</p>
    </div>
    {!series || series.error || !series.data ? (
      <div className="flex items-center gap-2 text-xs text-amber-500"><AlertCircle className="w-4 h-4" />{series?.error ?? 'No data.'}</div>
    ) : (
      <>
        <SimpleLineChart
          points={series.data.map((d) => ({ x: d.year, y: d.value }))}
          unit={series.unit || ''} color={color} zeroLine={zero} yFormat={fmt}
          ariaLabel={`${title} line chart`}
        />
        <div className="text-[11px] text-slate-400 space-y-0.5">
          <div>
            Range: {series.data[0].year}–{series.data[series.data.length - 1].year} · Units: {series.unit}
            {series.baseline ? ` · Baseline: ${series.baseline}` : ''} · <strong className="text-slate-300">Historical observations (no projections shown)</strong>
          </div>
          <div className="flex items-center gap-1.5">
            Source: {series.source}
            {series.url && <a href={series.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:underline">open <ExternalLink className="w-3 h-3" /></a>}
          </div>
        </div>
      </>
    )}
  </section>
);

export const AnalyticsView: React.FC = () => {
  const [state, setState] = useState<{ temperature?: Series; co2?: Series; fetchedAt?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    getJson('/api/analytics').then(setState).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const last = <T,>(a?: T[]) => (a && a.length ? a[a.length - 1] : undefined);
  const lt = last(state.temperature?.data), lc = last(state.co2?.data);

  return (
    <div className="max-w-4xl space-y-5 pb-16">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Climate Analytics</h1>
          <p className="text-xs text-slate-400">Long-term records loaded live from NASA and NOAA.</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-1 border border-slate-800 text-slate-300 hover:border-emerald-500/50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin text-emerald-400" />Loading datasets…</div>}
      {error && <div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle className="w-4 h-4" />{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-1 border border-slate-800 p-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Latest global temperature anomaly {lt ? `(${lt.year})` : ''}</div>
              <div className="text-3xl font-extrabold text-white mt-1">{lt ? `${lt.value > 0 ? '+' : ''}${lt.value.toFixed(2)} °C` : '—'}</div>
              <div className="text-[11px] text-slate-400">vs 1951–1980 average · NASA GISTEMP</div>
            </div>
            <div className="rounded-2xl bg-surface-1 border border-slate-800 p-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Latest annual CO₂ {lc ? `(${lc.year})` : ''}</div>
              <div className="text-3xl font-extrabold text-white mt-1">{lc ? `${lc.value.toFixed(1)} ppm` : '—'}</div>
              <div className="text-[11px] text-slate-400">Mauna Loa Observatory · NOAA GML</div>
            </div>
          </div>
          <Panel title="Global temperature anomaly" blurb="Yearly global land-ocean temperature difference from the 1951–1980 average." series={state.temperature} color="#f43f5e" zero fmt={(n) => n.toFixed(2)} />
          <Panel title="Atmospheric CO₂ (Mauna Loa)" blurb="Annual mean carbon dioxide concentration in parts per million." series={state.co2} color="#0ea5e9" fmt={(n) => n.toFixed(0)} />
          <EmissionsPanel />
          <HistoryPanel />
          <p className="text-[11px] text-slate-400">Sea-level data is not connected yet. Data fetched {state.fetchedAt ? new Date(state.fetchedAt).toLocaleString() : ''}; the latest year may be partial or provisional.</p>
        </>
      )}
    </div>
  );
};
