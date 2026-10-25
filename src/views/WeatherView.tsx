import React, { useEffect, useRef, useState } from 'react';
import { getJson, GeoResult, placeLabel, readStore, writeStore } from '../services/api';
import { useSettings, toDisplayTemp, toDisplaySpeed, speedLabel } from '../settings';
import { SimpleLineChart } from '../components/SimpleLineChart';
import { Search, Loader2, AlertCircle, MapPin, Star, Droplets, Wind, Sun, Gauge, Cloud, Sunrise, Sunset, LocateFixed, X } from 'lucide-react';

interface Saved { name: string; country: string; admin1: string; latitude: number; longitude: number }
interface WeatherResp { weather: any; fetchedAt: string; source: string }

const FAV_KEY = 'climatelens.favorites.v1';
const RECENT_KEY = 'climatelens.recent.v1';
const LAST_KEY = 'climatelens.lastplace.v1';

const aqiLabel = (v: number) => (v <= 50 ? 'Good' : v <= 100 ? 'Moderate' : v <= 150 ? 'Unhealthy for sensitive groups' : v <= 200 ? 'Unhealthy' : v <= 300 ? 'Very unhealthy' : 'Hazardous');
const same = (a: Saved, b: Saved) => Math.abs(a.latitude - b.latitude) < 0.01 && Math.abs(a.longitude - b.longitude) < 0.01;

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-surface-2 border border-slate-800 p-3">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400">{icon}{label}</div>
    <div className="mt-1 text-sm font-bold text-white">{value}</div>
  </div>
);

export const WeatherView: React.FC = () => {
  const { settings } = useSettings();
  const t = (c: number) => `${toDisplayTemp(c, settings.tempUnit)}°${settings.tempUnit}`;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [place, setPlace] = useState<Saved | null>(() => readStore<Saved | null>(LAST_KEY, null));
  const [data, setData] = useState<WeatherResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favs, setFavs] = useState<Saved[]>(() => readStore<Saved[]>(FAV_KEY, []));
  const [recent, setRecent] = useState<Saved[]>(() => readStore<Saved[]>(RECENT_KEY, []));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSearching(true);
      getJson<{ results: GeoResult[] }>(`/api/geocode?q=${encodeURIComponent(query.trim())}`)
        .then((d) => setResults(d.results)).catch((e) => setError(e.message)).finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timer.current);
  }, [query]);

  useEffect(() => {
    if (!place) return;
    setLoading(true); setError('');
    getJson<WeatherResp>(`/api/weather?lat=${place.latitude}&lon=${place.longitude}`)
      .then(setData).catch((e) => { setData(null); setError(e.message); }).finally(() => setLoading(false));
  }, [place]);

  const choose = (p: Saved) => {
    setPlace(p); setQuery(''); setResults([]);
    writeStore(LAST_KEY, p);
    const next = [p, ...recent.filter((r) => !same(r, p))].slice(0, 6);
    setRecent(next); writeStore(RECENT_KEY, next);
  };
  const isFav = place ? favs.some((f) => same(f, place)) : false;
  const toggleFav = () => {
    if (!place) return;
    const next = isFav ? favs.filter((f) => !same(f, place)) : [place, ...favs].slice(0, 12);
    setFavs(next); writeStore(FAV_KEY, next);
  };
  const locate = () => {
    if (!navigator.geolocation) { setError('Your browser does not support location access.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => choose({ name: 'My location', country: '', admin1: '', latitude: +pos.coords.latitude.toFixed(3), longitude: +pos.coords.longitude.toFixed(3) }),
      () => setError('Location permission was denied. Search for a city instead.')
    );
  };

  const w = data?.weather;
  const cur = w?.current;
  const today = w?.daily?.[0];
  const hourPts = w ? w.hourly.map((h: any, i: number) => ({ x: i, y: toDisplayTemp(h.temperature, settings.tempUnit), label: `${h.time.slice(11, 16)} · ${h.condition}` })) : [];

  return (
    <div className="max-w-4xl space-y-5 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Weather & Forecast</h1>
        <p className="text-xs text-slate-400">Live conditions, 24-hour and 7-day forecast and air quality for any place.</p>
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a city, e.g. Phagwara, London, Tokyo" aria-label="Search location"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-1 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500" />
            {searching && <Loader2 className="w-4 h-4 animate-spin text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />}
          </div>
          <button onClick={locate} className="px-3.5 rounded-xl bg-surface-1 border border-slate-700 text-slate-300 hover:border-emerald-500/60 flex items-center gap-1.5 text-xs font-semibold" title="Use my location">
            <LocateFixed className="w-4 h-4" /><span className="hidden sm:inline">My location</span>
          </button>
        </div>
        {results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full rounded-xl bg-surface-1 border border-slate-700 shadow-xl overflow-hidden">
            {results.map((r, i) => (
              <li key={i}><button onClick={() => choose(r)} className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-surface-2 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-400" />{placeLabel(r)}</button></li>
            ))}
          </ul>
        )}
      </div>

      {(favs.length > 0 || recent.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {favs.map((f) => (
            <button key={`f${f.latitude}${f.longitude}`} onClick={() => choose(f)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"><Star className="w-3 h-3 fill-current" />{f.name}</button>
          ))}
          {recent.filter((r) => !favs.some((f) => same(f, r))).map((r) => (
            <button key={`r${r.latitude}${r.longitude}`} onClick={() => choose(r)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-1 border border-slate-800 text-slate-300 hover:border-emerald-500/50">{r.name}</button>
          ))}
        </div>
      )}

      {error && <div className="flex items-start gap-2 text-xs text-red-400"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}<button onClick={() => setError('')} aria-label="Dismiss"><X className="w-3.5 h-3.5" /></button></div>}
      {!place && !loading && <div className="rounded-3xl bg-surface-1 border border-slate-800 p-8 text-center text-sm text-slate-400">Search for a place above to see its weather.</div>}
      {loading && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin text-emerald-400" />Fetching live weather…</div>}

      {place && w && !loading && (
        <div className="space-y-4">
          <section className="rounded-3xl bg-surface-1 border border-slate-800 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400"><MapPin className="w-3.5 h-3.5 text-emerald-400" />{placeLabel(place)}</div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-6xl font-extrabold text-white tracking-tight">{t(cur.temperature)}</span>
                  <span className="text-base text-slate-300">{cur.condition}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Feels like {t(cur.feelsLike)} · High {t(today.tempMax)} · Low {t(today.tempMin)}</div>
              </div>
              <button onClick={toggleFav} aria-pressed={isFav} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${isFav ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-surface-2 border-slate-800 text-slate-300'}`}>
                <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />{isFav ? 'Saved' : 'Save'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <Stat icon={<Droplets className="w-3 h-3" />} label="Humidity" value={`${cur.humidity}%`} />
              <Stat icon={<Wind className="w-3 h-3" />} label="Wind" value={`${toDisplaySpeed(cur.windSpeed, settings.distUnit)} ${speedLabel(settings.distUnit)} · ${Math.round(cur.windDirection)}°`} />
              <Stat icon={<Gauge className="w-3 h-3" />} label="Pressure" value={`${Math.round(cur.pressure)} hPa`} />
              <Stat icon={<Cloud className="w-3 h-3" />} label="Cloud cover" value={`${cur.cloudCover}%`} />
              <Stat icon={<Sun className="w-3 h-3" />} label="UV (today max)" value={today.uvIndexMax != null ? String(today.uvIndexMax) : '—'} />
              <Stat icon={<Droplets className="w-3 h-3" />} label="Rain chance" value={today.precipProbability != null ? `${today.precipProbability}%` : '—'} />
              <Stat icon={<Sunrise className="w-3 h-3" />} label="Sunrise" value={today.sunrise.slice(11, 16)} />
              <Stat icon={<Sunset className="w-3 h-3" />} label="Sunset" value={today.sunset.slice(11, 16)} />
            </div>
            {w.airQuality?.usAqi != null && (
              <div className="mt-4 text-xs text-slate-300">Air quality: <strong className="text-white">US AQI {w.airQuality.usAqi}</strong> ({aqiLabel(w.airQuality.usAqi)}) · PM2.5 {w.airQuality.pm25} µg/m³ · PM10 {w.airQuality.pm10} µg/m³</div>
            )}
          </section>

          <section className="rounded-3xl bg-surface-1 border border-slate-800 p-5 sm:p-6 space-y-2">
            <h2 className="text-sm font-bold text-white">Next 24 hours — temperature</h2>
            <SimpleLineChart points={hourPts} unit={`°${settings.tempUnit}`} yFormat={(y) => String(Math.round(y))} xFormat={(x) => `${w.hourly[Math.min(x, 23)].time.slice(11, 13)}h`} color="#f59e0b" height={200} ariaLabel="Hourly temperature chart" />
          </section>

          <section className="rounded-3xl bg-surface-1 border border-slate-800 p-5 sm:p-6">
            <h2 className="text-sm font-bold text-white mb-2">7-day forecast</h2>
            <div className="divide-y divide-slate-800">
              {w.daily.map((d: any) => (
                <div key={d.date} className="flex items-center gap-3 py-2 text-xs">
                  <span className="w-20 font-semibold text-slate-200">{new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className="flex-1 text-slate-400 truncate">{d.condition}</span>
                  <span className="w-20 text-right text-cyan-400">{d.precipSum != null ? `${d.precipSum} mm` : '—'}</span>
                  <span className="w-28 text-right font-mono text-slate-200">{t(d.tempMin)} / {t(d.tempMax)}</span>
                </div>
              ))}
            </div>
          </section>
          <p className="text-[11px] text-slate-400">Source: {data?.source} · Updated {data ? new Date(data.fetchedAt).toLocaleString() : ''} · Model forecast, not a guarantee. Severe-weather alerts are not included.</p>
        </div>
      )}
    </div>
  );
};
