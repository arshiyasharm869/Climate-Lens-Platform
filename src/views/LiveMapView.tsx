import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3Geo from 'd3-geo';
import { worldLandFeature, worldCountriesFeature } from '../services/geoData';
import { getJson } from '../services/api';
import { useSettings, toDisplayTemp, toDisplaySpeed, speedLabel } from '../settings';
import { Loader2, AlertCircle, RefreshCw, MapPin, X } from 'lucide-react';

type Stop = [number, string];
interface Layer { id: string; label: string; unit: string; key: string; kind: 'weather' | 'air'; stops: Stop[]; fmt?: (v: number) => string }

const LAYERS: Layer[] = [
  { id: 'temp', label: 'Temperature', unit: '°C', key: 'temperature_2m', kind: 'weather', stops: [[-30, '#4338ca'], [-10, '#3b82f6'], [5, '#22d3ee'], [15, '#86efac'], [25, '#facc15'], [35, '#f97316'], [45, '#b91c1c']] },
  { id: 'feels', label: 'Feels like', unit: '°C', key: 'apparent_temperature', kind: 'weather', stops: [[-30, '#4338ca'], [-10, '#3b82f6'], [5, '#22d3ee'], [15, '#86efac'], [25, '#facc15'], [35, '#f97316'], [45, '#b91c1c']] },
  { id: 'rain', label: 'Rainfall', unit: 'mm/h', key: 'precipitation', kind: 'weather', stops: [[0, '#e0f2fe'], [0.5, '#7dd3fc'], [2, '#3b82f6'], [5, '#4338ca'], [10, '#7e22ce']] },
  { id: 'hum', label: 'Humidity', unit: '%', key: 'relative_humidity_2m', kind: 'weather', stops: [[0, '#fde68a'], [40, '#bef264'], [70, '#5eead4'], [100, '#1d4ed8']] },
  { id: 'wind', label: 'Wind speed', unit: 'km/h', key: 'wind_speed_10m', kind: 'weather', stops: [[0, '#ecfeff'], [15, '#67e8f9'], [30, '#818cf8'], [50, '#c026d3'], [80, '#7f1d1d']] },
  { id: 'cloud', label: 'Cloud cover', unit: '%', key: 'cloud_cover', kind: 'weather', stops: [[0, '#fef9c3'], [50, '#cbd5e1'], [100, '#475569']] },
  { id: 'pres', label: 'Pressure', unit: 'hPa', key: 'pressure_msl', kind: 'weather', stops: [[980, '#7c3aed'], [1000, '#60a5fa'], [1013, '#a7f3d0'], [1025, '#fcd34d'], [1040, '#ea580c']] },
  { id: 'uv', label: 'UV index', unit: 'index', key: 'uv_index', kind: 'weather', stops: [[0, '#bbf7d0'], [3, '#fde047'], [6, '#fb923c'], [8, '#dc2626'], [11, '#7e22ce']] },
  { id: 'soil', label: 'Soil moisture (drought proxy)', unit: 'm³/m³', key: 'soil_moisture_0_to_7cm', kind: 'weather', stops: [[0.03, '#92400e'], [0.12, '#d6a96a'], [0.25, '#86efac'], [0.4, '#1d4ed8']] },
  { id: 'pm25', label: 'PM2.5 air quality', unit: 'µg/m³', key: 'pm2_5', kind: 'air', stops: [[0, '#86efac'], [12, '#fde047'], [35, '#fb923c'], [75, '#dc2626'], [150, '#701a75']] },
];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function colorAt(stops: Stop[], v: number): string {
  if (v <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [v0, c0] = stops[i - 1], [v1, c1] = stops[i];
      const f = (v - v0) / (v1 - v0 || 1), a = hex(c0), b = hex(c1);
      return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * f)).join(',')})`;
    }
  }
  return stops[stops.length - 1][1];
}

const W = 960, H = 480;

export const LiveMapView: React.FC = () => {
  const { settings } = useSettings();
  const [layerId, setLayerId] = useState('temp');
  const [opacity, setOpacity] = useState(0.8);
  const [grids, setGrids] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hour, setHour] = useState(0);
  const [showFires, setShowFires] = useState(false);
  const [fires, setFires] = useState<any>(null);
  const [picked, setPicked] = useState<{ lat: number; lon: number; w?: any; err?: string; busy?: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layer = LAYERS.find((l) => l.id === layerId)!;

  const projection = useMemo(() => d3Geo.geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]), []);
  const landPath = useMemo(() => d3Geo.geoPath(projection)(worldLandFeature as any) || '', [projection]);
  const borderPath = useMemo(() => d3Geo.geoPath(projection)(worldCountriesFeature as any) || '', [projection]);

  const loadGrid = (kind: 'weather' | 'air', force = false) => {
    if (grids[kind] && !force) return;
    setLoading(true); setError('');
    getJson(`/api/map-grid?kind=${kind}`).then((d) => setGrids((g) => ({ ...g, [kind]: d }))).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { loadGrid(layer.kind); }, [layer.kind]);

  useEffect(() => {
    if (!showFires || fires) return;
    getJson('/api/fires').then(setFires).catch((e) => setFires({ error: e.message }));
  }, [showFires, fires]);

  const grid = grids[layer.kind];
  const maxHour = Math.max(0, (grid?.times?.length ?? 1) - 1);
  const hourIdx = Math.min(hour, maxHour);
  const timeLabel = grid?.times?.[hourIdx]
    ? new Date(grid.times[hourIdx] + 'Z').toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    : '';
  const display = (v: number) => {
    if (layer.unit === '°C') return `${toDisplayTemp(v, settings.tempUnit)}°${settings.tempUnit}`;
    if (layer.unit === 'km/h') return `${toDisplaySpeed(v, settings.distUnit)} ${speedLabel(settings.distUnit)}`;
    return `${Math.round(v * 10) / 10} ${layer.unit}`;
  };

  const cell = (W / 360) * (grid?.cellDegrees ?? 15);
  const cells = useMemo(() => {
    if (!grid) return [];
    return grid.points.filter((p: any) => typeof p[layer.key]?.[hourIdx] === 'number').map((p: any) => {
      const [x, y] = projection([p.lon, p.lat])!;
      return { x: x - cell / 2, y: y - cell / 2, v: p[layer.key][hourIdx] as number };
    });
  }, [grid, layer.key, hourIdx, projection, cell]);

  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    const lon = ((e.clientX - r.left) / r.width) * 360 - 180;
    const lat = 90 - ((e.clientY - r.top) / r.height) * 180;
    if (lat < -85 || lat > 85) return;
    const la = +lat.toFixed(2), lo = +lon.toFixed(2);
    setPicked({ lat: la, lon: lo, busy: true });
    getJson(`/api/weather?lat=${la}&lon=${lo}`)
      .then((d) => setPicked({ lat: la, lon: lo, w: d.weather }))
      .catch((er) => setPicked({ lat: la, lon: lo, err: er.message }));
  };

  const legendStops = layer.stops.map(([v, c], i) => `${c} ${(i / (layer.stops.length - 1)) * 100}%`).join(', ');
  const pm = picked?.w;
  const marker = picked ? projection([picked.lon, picked.lat]) : null;

  return (
    <div className="max-w-5xl space-y-4 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Live Climate Map</h1>
          <p className="text-xs text-slate-400">Pick a layer, then click anywhere on the map for local conditions.</p>
        </div>
        <button onClick={() => loadGrid(layer.kind, true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-1 border border-slate-800 text-slate-300 hover:border-emerald-500/50"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Map layer">
        {LAYERS.map((l) => (
          <button key={l.id} role="radio" aria-checked={l.id === layerId} onClick={() => setLayerId(l.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${l.id === layerId ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-surface-1 border-slate-800 text-slate-300 hover:border-emerald-500/50'}`}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        <div className="rounded-3xl bg-surface-1 border border-slate-800 p-3 relative overflow-hidden">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-2xl cursor-crosshair" onClick={onClick} role="img" aria-label={`World map showing ${layer.label}`}>
            <rect width={W} height={H} fill="var(--color-surface-2)" />
            {cells.map((c: any, i: number) => (
              <rect key={i} x={c.x} y={c.y} width={cell + 0.5} height={cell + 0.5} fill={colorAt(layer.stops, c.v)} opacity={opacity}><title>{display(c.v)}</title></rect>
            ))}
            <path d={borderPath} fill="none" stroke="var(--color-slate-600)" strokeWidth="0.35" opacity="0.7" />
            <path d={landPath} fill="none" stroke="var(--color-slate-300)" strokeWidth="0.6" opacity="0.9" />
            {showFires && fires?.cells?.map((f: any, i: number) => {
              const pt = projection([f.lon, f.lat]);
              return pt ? <circle key={i} cx={pt[0]} cy={pt[1]} r={Math.min(6, 1.5 + Math.log2(f.count))} fill="#ef4444" stroke="#fff" strokeWidth="0.4" opacity="0.85"><title>{`${f.count} hotspot(s)`}</title></circle> : null;
            })}
            {marker && <g><circle cx={marker[0]} cy={marker[1]} r="5" fill="#fff" stroke="#111" strokeWidth="2" /></g>}
          </svg>
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-surface-1/60"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface-1 border border-slate-800 p-4 space-y-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Legend · {layer.label} ({layer.unit === '°C' ? `°${settings.tempUnit}` : layer.unit})</div>
            <div className="h-3 rounded-full" style={{ background: `linear-gradient(to right, ${legendStops})` }} />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{layer.unit === '°C' ? toDisplayTemp(layer.stops[0][0], settings.tempUnit) : layer.stops[0][0]}</span>
              <span>{layer.unit === '°C' ? toDisplayTemp(layer.stops[layer.stops.length - 1][0], settings.tempUnit) : layer.stops[layer.stops.length - 1][0]}</span>
            </div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Forecast time (+{hourIdx} h){timeLabel ? ` · ${timeLabel}` : ''}
              <input type="range" min="0" max={maxHour} step="1" value={hourIdx} onChange={(e) => setHour(+e.target.value)} className="w-full mt-1 accent-emerald-500" aria-label="Forecast hour" />
            </label>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-200 cursor-pointer">
              <input type="checkbox" checked={showFires} onChange={(e) => setShowFires(e.target.checked)} className="accent-emerald-500" /> Wildfire hotspots (NASA FIRMS)
            </label>
            {showFires && fires && (fires.configured === false || fires.error) && <p className="text-[11px] text-amber-500">{fires.message || fires.error}</p>}
            {showFires && fires?.configured && <p className="text-[11px] text-slate-400">{fires.cells.length} hotspot areas · last 24 h</p>}
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Layer opacity
              <input type="range" min="0.2" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full mt-1 accent-emerald-500" />
            </label>
          </div>

          <div className="rounded-2xl bg-surface-1 border border-slate-800 p-4 min-h-[140px]">
            {!picked && <p className="text-xs text-slate-400 flex items-start gap-2"><MapPin className="w-4 h-4 text-emerald-400 shrink-0" />Click the map to see conditions for that spot.</p>}
            {picked?.busy && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin text-emerald-400" />Loading…</div>}
            {picked?.err && <div className="text-xs text-red-400 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{picked.err}</div>}
            {pm && (
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between"><span className="font-bold text-white">{picked!.lat.toFixed(2)}°, {picked!.lon.toFixed(2)}°</span><button onClick={() => setPicked(null)} aria-label="Clear"><X className="w-3.5 h-3.5 text-slate-400" /></button></div>
                <div className="text-lg font-extrabold text-white">{toDisplayTemp(pm.current.temperature, settings.tempUnit)}°{settings.tempUnit} <span className="text-xs font-medium text-slate-400">{pm.current.condition}</span></div>
                <div>Feels like {toDisplayTemp(pm.current.feelsLike, settings.tempUnit)}° · Humidity {pm.current.humidity}%</div>
                <div>Wind {toDisplaySpeed(pm.current.windSpeed, settings.distUnit)} {speedLabel(settings.distUnit)} · Cloud {pm.current.cloudCover}%</div>
                <div>Pressure {Math.round(pm.current.pressure)} hPa · UV max {pm.daily[0].uvIndexMax ?? '—'}</div>
                {pm.airQuality?.usAqi != null && <div>US AQI {pm.airQuality.usAqi} · PM2.5 {pm.airQuality.pm25} µg/m³</div>}
              </div>
            )}
          </div>
        </aside>
      </div>

      {error && <div className="flex items-start gap-2 text-xs text-red-400"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
      <p className="text-[11px] text-slate-400">
        {grid ? <>Source: {grid.source}. Fetched {new Date(grid.fetchedAt).toLocaleString()}. Each coloured block is one sample point per 15° cell (about 1,600 km), so local detail is smoothed. </> : null}
        Colours show model forecast values for the selected hour (not satellite observations). Soil moisture is only a rough drought indicator, not an official drought index. Official flood and severe-weather alerts are not included.
      </p>
    </div>
  );
};
