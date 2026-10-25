import React, { useEffect, useRef, useState } from 'react';
import { PageId } from '../types/climate';
import { useSettings, toDisplayTemp, toDisplaySpeed, speedLabel } from '../settings';
import {
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
  Plus,
  MapPin,
  Droplets,
  Wind,
  Sun,
  Gauge,
  AlertCircle,
  Globe2,
  GitCompare,
} from 'lucide-react';

interface WeatherCard {
  location: { name: string; country: string; admin1: string; latitude: number; longitude: number };
  weather: {
    current: {
      time: string; temperature: number; feelsLike: number; humidity: number; precipitation: number;
      cloudCover: number; pressure: number; windSpeed: number; windDirection: number; condition: string;
    };
    hourly: { time: string; temperature: number; precipProbability: number | null; condition: string }[];
    daily: {
      date: string; condition: string; tempMax: number; tempMin: number; precipSum: number | null;
      precipProbability: number | null; uvIndexMax: number | null;
    }[];
    airQuality: { usAqi: number | null; pm25: number | null; pm10: number | null } | null;
  };
  fetchedAt: string;
  source: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  cards?: WeatherCard[];
  limitations?: string[];
  source?: string;
  error?: boolean;
}

const STORAGE_KEY = 'climatelens.chat.v1';
const SUGGESTIONS = [
  'Weather in Delhi today',
  '7-day forecast for Mumbai',
  'Compare India and Canada',
  'How hot is it in Dubai right now?',
];

const uid = () => Math.random().toString(36).slice(2, 10);

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

// Minimal, safe markdown: **bold** and "- " bullets (no raw HTML is ever injected)
const Inline: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    )}
  </>
);

const Markdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-300">
      {lines.map((line, i) => {
        const bullet = line.match(/^\s*[-*•]\s+(.*)/);
        if (bullet)
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-emerald-400">◆</span>
              <span><Inline text={bullet[1]} /></span>
            </div>
          );
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i}><Inline text={line} /></p>;
      })}
    </div>
  );
};

const WeatherCardView: React.FC<{ card: WeatherCard; onNavigate: (p: PageId) => void; onCompare: (name: string) => void }> = ({
  card,
  onNavigate,
  onCompare,
}) => {
  const { settings } = useSettings();
  const t = (c: number) => `${toDisplayTemp(c, settings.tempUnit)}°${settings.tempUnit}`;
  const { current, daily, hourly, airQuality } = card.weather;
  const where = [card.location.name, card.location.admin1, card.location.country].filter(Boolean).join(', ');
  const maxH = Math.max(...hourly.map((h) => h.temperature));
  const minH = Math.min(...hourly.map((h) => h.temperature));

  return (
    <div className="rounded-2xl bg-surface-2 border border-slate-800 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {where}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{t(current.temperature)}</span>
            <span className="text-sm text-slate-300">{current.condition}</span>
          </div>
          <div className="text-xs text-slate-400">Feels like {t(current.feelsLike)}</div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300">
          <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-cyan-400" />{current.humidity}%</span>
          <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-cyan-400" />{toDisplaySpeed(current.windSpeed, settings.distUnit)} {speedLabel(settings.distUnit)}</span>
          <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-cyan-400" />{Math.round(current.pressure)} hPa</span>
          <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-400" />UV {daily[0]?.uvIndexMax ?? '—'}</span>
        </div>
      </div>

      {airQuality && airQuality.usAqi != null && (
        <div className="text-xs text-slate-300">
          Air quality: <strong className="text-white">US AQI {airQuality.usAqi}</strong> · PM2.5 {airQuality.pm25} µg/m³ · PM10 {airQuality.pm10} µg/m³
        </div>
      )}

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Next 24 hours</div>
        <div className="flex items-end gap-1 h-16 overflow-x-auto pb-1">
          {hourly.map((h, i) => {
            const pct = maxH === minH ? 50 : 20 + ((h.temperature - minH) / (maxH - minH)) * 80;
            return (
              <div key={h.time} className="flex flex-col items-center justify-end gap-1 min-w-[22px]" title={`${h.time.slice(11, 16)} · ${t(h.temperature)} · ${h.condition}`}>
                <div className="w-3 rounded-t bg-emerald-500/70" style={{ height: `${pct * 0.4}px` }} />
                {i % 3 === 0 && <span className="text-[9px] text-slate-400">{h.time.slice(11, 13)}h</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">7-day forecast</div>
        <div className="divide-y divide-slate-800">
          {daily.map((d) => (
            <div key={d.date} className="flex items-center justify-between py-1.5 text-xs">
              <span className="w-20 text-slate-300 font-medium">
                {new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
              </span>
              <span className="flex-1 text-slate-400 truncate px-2">{d.condition}</span>
              <span className="w-12 text-right text-cyan-400">{d.precipProbability != null ? `${d.precipProbability}%` : '—'}</span>
              <span className="w-24 text-right text-slate-200 font-mono">{t(d.tempMin)} / {t(d.tempMax)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="text-[10px] text-slate-400">
          Source: {card.source} · Updated {new Date(card.fetchedAt).toLocaleString()} · Forecast model data, not a guarantee
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('map')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:border-emerald-500/50">
            <Globe2 className="w-3.5 h-3.5" /> Explore on map
          </button>
          <button onClick={() => onCompare(card.location.name)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:border-emerald-500/50">
            <GitCompare className="w-3.5 h-3.5" /> Compare
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClimateAiView: React.FC<{ onNavigate: (p: PageId) => void }> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // cards can be large; keep only the last 20 messages
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      /* ignore */
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((m) => [...m, { id: uid(), role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setMessages((m) => [
        ...m,
        { id: uid(), role: 'assistant', text: data.reply, cards: data.cards, limitations: data.limitations, source: data.source },
      ]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { id: uid(), role: 'assistant', error: true, text: e?.message || 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    setMessages((m) => m.filter((x, i) => !(i === m.length - 1 && x.error)));
    send(lastUser.text);
  };

  const newChat = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-9rem)] min-h-[480px]">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" /> Climate AI
          </h1>
          <p className="text-xs text-slate-400">Chat with the planet: live weather, forecasts and air quality for any city or country.</p>
        </div>
        <button onClick={newChat} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-1 border border-slate-800 text-slate-300 hover:border-emerald-500/50">
          <Plus className="w-3.5 h-3.5" /> New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-3xl bg-surface-1 border border-slate-800 p-4 sm:p-6 space-y-5" aria-live="polite">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Ask about any place on Earth</h2>
              <p className="text-xs text-slate-400 mt-1">Type a city, region or country, or try one of these:</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="px-3.5 py-2 rounded-full text-xs font-medium bg-surface-2 border border-slate-800 text-slate-200 hover:border-emerald-500/60 hover:text-emerald-400 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-emerald-500 text-slate-950 text-sm font-semibold">{m.text}</div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                {m.error ? (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      {m.text}
                      <button onClick={retry} className="mt-2 flex items-center gap-1.5 text-xs font-bold underline">
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  </div>
                ) : (
                  <Markdown text={m.text} />
                )}
                {m.cards?.map((c, i) => (
                  <WeatherCardView
                    key={i}
                    card={c}
                    onNavigate={onNavigate}
                    onCompare={(name) => setInput(`Compare ${name} and `)}
                  />
                ))}
                {m.limitations?.map((l, i) => (
                  <div key={i} className="text-[11px] text-amber-500 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {l}
                  </div>
                ))}
                {m.source && m.source !== 'none' && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Summary: {m.source === 'template' ? 'auto-generated from data (add GEMINI_API_KEY for AI summaries)' : m.source}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Fetching live data…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2 pt-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="e.g. Weather in Phagwara today"
          aria-label="Message Climate AI"
          className="flex-1 px-4 py-3 rounded-xl bg-surface-1 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
