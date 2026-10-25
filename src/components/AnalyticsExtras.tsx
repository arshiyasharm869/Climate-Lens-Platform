import React, { useEffect, useRef, useState } from 'react';
import { getJson, GeoResult, placeLabel } from '../services/api';
import { SimpleLineChart } from './SimpleLineChart';
import { Loader2, AlertCircle, ExternalLink, Search } from 'lucide-react';
import { useSettings } from '../settings';

const Card: React.FC<{ title: string; blurb: string; children: React.ReactNode }> = ({ title, blurb, children }) => (
  <section className="rounded-3xl bg-surface-1 border border-slate-800 p-5 sm:p-6 space-y-3">
    <div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="text-xs text-slate-400">{blurb}</p>
    </div>
    {children}
  </section>
);

export const EmissionsPanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [region, setRegion] = useState('World');
  const [error, setError] = useState('');
  useEffect(() => { getJson('/api/emissions').then(setData).catch((e) => setError(e.message)); }, []);
  const s: { year: number; value: number }[] | undefined = data?.series?.[region];
  return (
    <Card title="CO₂ emissions by region" blurb="Annual fossil-fuel and industry emissions (million tonnes of CO₂).">
      {error && <div className="flex items-center gap-2 text-xs text-amber-500"><AlertCircle className="w-4 h-4" />{error}</div>}
      {!data && !error && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin text-emerald-400" />Loading…</div>}
      {data && (
        <>
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region" className="px-3 py-2 rounded-xl bg-surface-2 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
            {data.regions.map((r: string) => <option key={r}>{r}</option>)}
          </select>
          {s && s.length > 1 ? (
            <SimpleLineChart points={s.map((d) => ({ x: d.year, y: d.value }))} unit="Mt CO₂" color="#a855f7" yFormat={(n) => Math.round(n).toLocaleString()} ariaLabel={`CO2 emissions for ${region}`} />
          ) : <div className="text-xs text-slate-400">No data for this region.</div>}
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <div>{s && s.length ? `Range: ${s[0].year}–${s[s.length - 1].year} · ` : ''}Units: {data.unit} · <strong className="text-slate-300">Historical estimates</strong></div>
            <div className="flex items-center gap-1.5">Source: {data.source}<a href={data.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:underline">open <ExternalLink className="w-3 h-3" /></a></div>
          </div>
        </>
      )}
    </Card>
  );
};

export const HistoryPanel: React.FC = () => {
  const { settings } = useSettings();
  const [place, setPlace] = useState({ name: 'Delhi', admin1: 'Delhi', country: 'India', latitude: 28.65, longitude: 77.23 });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      getJson<{ results: GeoResult[] }>(`/api/geocode?q=${encodeURIComponent(query.trim())}`).then((d) => setResults(d.results)).catch(() => setResults([]));
    }, 350);
    return () => clearTimeout(timer.current);
  }, [query]);

  useEffect(() => {
    setLoading(true); setError('');
    getJson(`/api/climate-history?lat=${place.latitude}&lon=${place.longitude}`).then(setData).catch((e) => { setData(null); setError(e.message); }).finally(() => setLoading(false));
  }, [place]);

  const years: { year: number; temperature: number; precipitation: number }[] = data?.years ?? [];
  const u = settings.tempUnit;
  return (
    <Card title="Local climate history" blurb="Yearly average temperature and total rainfall for any place, since 1950.">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Showing ${placeLabel(place)} — search another place`} aria-label="Search place for climate history"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-2 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500" />
        {results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full rounded-xl bg-surface-1 border border-slate-700 shadow-xl overflow-hidden">
            {results.map((r, i) => (
              <li key={i}><button onClick={() => { setPlace(r); setQuery(''); setResults([]); }} className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-surface-2">{placeLabel(r)}</button></li>
            ))}
          </ul>
        )}
      </div>
      {loading && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin text-emerald-400" />Loading 75 years of data…</div>}
      {error && <div className="flex items-center gap-2 text-xs text-amber-500"><AlertCircle className="w-4 h-4" />{error}</div>}
      {!loading && years.length > 2 && (
        <>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Mean annual temperature (°{u})</div>
          <SimpleLineChart points={years.map((y) => ({ x: y.year, y: u === 'F' ? (y.temperature * 9) / 5 + 32 : y.temperature }))} unit={`°${u}`} color="#f43f5e" yFormat={(n) => n.toFixed(1)} ariaLabel="Annual mean temperature" height={200} />
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Total annual precipitation (mm)</div>
          <SimpleLineChart points={years.map((y) => ({ x: y.year, y: y.precipitation }))} unit="mm" color="#0ea5e9" yFormat={(n) => String(Math.round(n))} ariaLabel="Annual precipitation" height={200} />
          <div className="text-[11px] text-slate-400">Range: {years[0].year}–{years[years.length - 1].year} · {data.source} · <strong className="text-slate-300">Historical reanalysis</strong>. {data.note}</div>
        </>
      )}
    </Card>
  );
};
