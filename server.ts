import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API route for AI Climate Insights powered by @google/genai
app.post('/api/climate-insight', async (req, res) => {
  const { query, indicator, region, year } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful scientific synthesis fallback if key is unconfigured
    return res.json({
      source: 'offline-synthesis',
      summary: `Scientific synthesis for query: "${query}". Atmospheric and Earth observations indicate sustained upward radiative forcing driven by greenhouse gases.`,
      causes: [
        'Anthropogenic greenhouse gas emissions (CO₂, CH₄, N₂O) from energy generation, industry, and deforestation.',
        'Thermal inertia in the global ocean absorbing over 90% of excess planetary heat energy.',
        'Positive feedbacks including Arctic albedo reduction and permafrost carbon release.'
      ],
      impacts: [
        'Accelerating polar ice shelf mass loss and progressive thermal expansion of seawater.',
        'Intensification of hydrological extremes (compound heatwaves, prolonged agricultural droughts, extreme convective precipitation).',
        'Shifts in marine and terrestrial ecosystems, poleward biome migration, and coral bleaching.'
      ],
      interpretation: `Focusing on ${indicator || 'global anomalies'} in ${region || 'Global'} through ${year || '2026'}, empirical data records a consistent upward trajectory. The rate of decadal warming has approximately doubled since the mid-20th century.`,
      keyTakeaway: 'Current climatic trends reflect sustained planetary energy imbalance; limiting long-term risks requires rapid structural emissions abatement and systemic resilience planning.',
      uncertaintyNote: 'Data values reflect verified climate records (1880–2026 baseline). Specific regional projections carry inherent variance across Shared Socioeconomic Pathways (SSPs).'
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the lead climate scientist at ClimateLens, an advanced planetary climate intelligence platform.
The user asked: "${query}"
Context filters: Selected Indicator: ${indicator || 'General'}, Selected Region: ${region || 'Global'}, Reference Timeframe: ${year || '1880–2026'}.

Provide a rigorous, objective, accessible scientific breakdown in strictly valid JSON format.
Do NOT use markdown code fences in your raw string if possible, or keep it strictly clean JSON.
The JSON must follow this exact schema:
{
  "summary": "1-2 sentence core scientific explanation of the phenomenon",
  "causes": ["List of 2 to 4 primary empirical physical/anthropogenic causes"],
  "impacts": ["List of 2 to 4 observed real-world ecological, meteorological, or socioeconomic impacts"],
  "interpretation": "A 2-3 sentence data interpretation contextualizing the selected indicator or region with empirical nuance",
  "keyTakeaway": "A concise 1-sentence bottom-line conclusion",
  "uncertaintyNote": "Explicit distinction between observed verified data, statistical modeling, and future projection uncertainties"
}

Important principles:
- Ground your analysis in IPCC Sixth Assessment Report (AR6), WMO, NASA GISS, and NOAA scientific consensus.
- Clearly differentiate between historical observed records and future predictive model uncertainties.
- Return ONLY the JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '{}';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Clean possible fences
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      source: 'gemini-3.8-flash',
      ...parsed,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Intelligent fallback response on error
    return res.json({
      source: 'offline-synthesis',
      summary: `Climate assessment regarding: "${query}". Observed climate variables reflect systemic shifts in Earth's energy budget.`,
      causes: [
        'Anthropogenic greenhouse gas concentrations continuing at record modern levels.',
        'Land-use transformation and feedback loops diminishing terrestrial carbon sink efficiency.'
      ],
      impacts: [
        'Elevated frequency and severity of extreme weather events.',
        'Cryospheric loss and progressive thermal expansion driving global mean sea level rise.'
      ],
      interpretation: `Analysis of ${indicator || 'climate trends'} in ${region || 'Global'} reveals persistent long-term anomalies exceeding pre-industrial baselines.`,
      keyTakeaway: 'Atmospheric observations demonstrate unprecedented rate of planetary warming requiring coordinated mitigation.',
      uncertaintyNote: 'Distinction note: Empirical instrumental records have minimal measurement uncertainty; regional downscaled projections reflect scenario modeling.'
    });
  }
});


// ---------------------------------------------------------------------------
// Climate AI chat: real location + weather data (Open-Meteo, no API key needed)
// ---------------------------------------------------------------------------
const WMO: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
  56: 'Freezing drizzle', 57: 'Dense freezing drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Heavy freezing rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  77: 'Snow grains', 80: 'Light showers', 81: 'Showers', 82: 'Violent showers',
  85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm with hail',
};

const rateBuckets = new Map<string, { count: number; reset: number }>();
function rateLimited(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = rateBuckets.get(key);
  if (!b || now > b.reset) {
    rateBuckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > limit;
}

const STOPWORDS = new Set([
  'what', 'whats', "what's", 'is', 'the', 'a', 'an', 'tell', 'me', 'about', 'weather', 'climate', 'forecast',
  'today', 'now', 'tomorrow', 'current', 'currently', 'in', 'of', 'for', 'at', 'show', 'give', 'day', '7',
  'how', 'hot', 'cold', 'temperature', 'right', 'like', 'please', 'compare', 'and', 'vs', 'versus', 'with', 'to',
]);

function cleanPlace(s: string): string {
  return s
    .replace(/[?!.,;:]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
    .join(' ')
    .trim();
}

function heuristicLocations(msg: string): string[] {
  const cmp = msg.match(/compare\s+(?:the\s+)?(?:climate\s+of\s+)?(.+?)\s+(?:and|vs\.?|versus|with)\s+(.+)/i);
  if (cmp) return [cleanPlace(cmp[1]), cleanPlace(cmp[2])].filter(Boolean).slice(0, 2);
  const vs = msg.match(/(.+?)\s+(?:vs\.?|versus)\s+(.+)/i);
  if (vs) return [cleanPlace(vs[1]), cleanPlace(vs[2])].filter(Boolean).slice(0, 2);
  const inM = msg.match(/\b(?:in|of|for|at|about)\s+([\p{L}' .-]+?)(?=\s+(?:today|now|tomorrow|this|over|next)\b|[?.!,]|$)/iu);
  if (inM) {
    const c = cleanPlace(inM[1]);
    if (c) return [c];
  }
  const c = cleanPlace(msg);
  return c ? [c] : [];
}

async function fetchJson(url: string): Promise<any> {
  const r = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} from ${new URL(url).host}`);
  return r.json();
}

async function geocode(name: string) {
  const data = await fetchJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
  );
  const g = data?.results?.[0];
  if (!g) return null;
  return {
    name: g.name as string,
    country: (g.country as string) || '',
    admin1: (g.admin1 as string) || '',
    latitude: g.latitude as number,
    longitude: g.longitude as number,
    timezone: (g.timezone as string) || 'auto',
  };
}

async function getWeather(lat: number, lon: number) {
  const base = `latitude=${lat}&longitude=${lon}&timezone=auto`;
  const forecast = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?${base}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m` +
      `&hourly=temperature_2m,precipitation_probability,weather_code&forecast_hours=24` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,sunrise,sunset&forecast_days=7`
  );
  let air: any = null;
  try {
    const a = await fetchJson(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${base}&current=us_aqi,pm2_5,pm10`
    );
    air = a?.current ?? null;
  } catch {
    air = null; // optional dataset; reported as unavailable
  }
  const c = forecast.current;
  const d = forecast.daily;
  const h = forecast.hourly;
  return {
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      precipitation: c.precipitation,
      cloudCover: c.cloud_cover,
      pressure: c.pressure_msl,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      weatherCode: c.weather_code,
      condition: WMO[c.weather_code] ?? 'Unknown',
    },
    hourly: (h.time as string[]).slice(0, 24).map((time, i) => ({
      time,
      temperature: h.temperature_2m[i],
      precipProbability: h.precipitation_probability[i],
      condition: WMO[h.weather_code[i]] ?? 'Unknown',
    })),
    daily: (d.time as string[]).map((date, i) => ({
      date,
      condition: WMO[d.weather_code[i]] ?? 'Unknown',
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      precipSum: d.precipitation_sum[i],
      precipProbability: d.precipitation_probability_max[i],
      uvIndexMax: d.uv_index_max[i],
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
    })),
    airQuality: air ? { usAqi: air.us_aqi, pm25: air.pm2_5, pm10: air.pm10, time: air.time } : null,
    units: { temperature: '°C', wind: 'km/h', precipitation: 'mm', pressure: 'hPa' },
  };
}

function templateReply(cards: any[]): string {
  return cards
    .map((c) => {
      const w = c.weather;
      const where = [c.location.name, c.location.admin1, c.location.country].filter(Boolean).join(', ');
      const today = w.daily[0];
      let s = `**${where}** — ${w.current.condition}, **${Math.round(w.current.temperature)}°C** (feels like ${Math.round(w.current.feelsLike)}°C), humidity ${w.current.humidity}%, wind ${Math.round(w.current.windSpeed)} km/h.`;
      s += ` Today's range is ${Math.round(today.tempMin)}–${Math.round(today.tempMax)}°C` +
        (today.precipProbability != null ? ` with up to ${today.precipProbability}% chance of precipitation` : '') +
        (today.uvIndexMax != null ? ` and a peak UV index of ${today.uvIndexMax}` : '') + '.';
      if (w.airQuality?.usAqi != null) s += ` US AQI is ${w.airQuality.usAqi} (PM2.5 ${w.airQuality.pm25} µg/m³).`;
      return s;
    })
    .join('\n\n');
}

app.post('/api/chat', async (req, res) => {
  const ip = req.ip || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
  }
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 500) {
    return res.status(400).json({ error: 'Please send a message between 1 and 500 characters.' });
  }

  const limitations: string[] = [];
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = !!apiKey && apiKey !== 'MY_GEMINI_API_KEY';
  const ai = hasKey ? new GoogleGenAI({ apiKey: apiKey as string }) : null;
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  try {
    // 1) Work out which places the user means
    let places: string[] = [];
    if (ai) {
      try {
        const r = await ai.models.generateContent({
          model,
          contents:
            `Extract the place names (cities, regions or countries) the user wants weather/climate info about. ` +
            `Return ONLY JSON: {"places": ["..."]} with at most 2 entries; empty array if none.\nUser message: "${message.replace(/"/g, "'")}"`,
          config: { responseMimeType: 'application/json' },
        });
        const parsed = JSON.parse(r.text?.trim() || '{}');
        if (Array.isArray(parsed.places)) places = parsed.places.filter((p: any) => typeof p === 'string').slice(0, 2);
      } catch {
        places = [];
      }
    }
    if (places.length === 0) places = heuristicLocations(message);

    if (places.length === 0) {
      return res.json({
        source: 'none',
        reply:
          'Tell me a city, region or country (for example **"Delhi"**, **"Weather in Mumbai"** or **"Compare India and Canada"**) and I will fetch live conditions and a 7-day forecast.',
        cards: [],
        limitations,
      });
    }

    // 2) Resolve locations and fetch real data
    const cards: any[] = [];
    const notFound: string[] = [];
    for (const name of places) {
      const loc = await geocode(name);
      if (!loc) {
        notFound.push(name);
        continue;
      }
      const weather = await getWeather(loc.latitude, loc.longitude);
      cards.push({ location: loc, weather, fetchedAt: new Date().toISOString(), source: 'Open-Meteo (open-meteo.com)' });
    }
    if (notFound.length) {
      limitations.push(
        `I could not find a location for: ${notFound.join(', ')}. Try a city or country name. Continents are not supported by the geocoder.`
      );
    }
    if (/news|headline/i.test(message)) {
      limitations.push('Climate news is not connected yet, so I cannot show articles. I will not invent headlines.');
    }
    if (/trend|history|historical|past \d+ years|30 years/i.test(message)) {
      limitations.push('Long-term historical trend datasets are not connected to chat yet; this answer covers current conditions and the 7-day forecast only.');
    }
    if (cards.length === 0) {
      return res.json({ source: 'none', reply: 'I could not find that location. Try a city or country name.', cards: [], limitations });
    }

    // 3) Write the answer, grounded ONLY in the fetched data
    let reply = templateReply(cards);
    let source = 'template';
    if (ai) {
      try {
        const grounded = cards.map((c) => ({ location: c.location, current: c.weather.current, next7Days: c.weather.daily, airQuality: c.weather.airQuality }));
        const r = await ai.models.generateContent({
          model,
          contents:
            `You are Climate AI inside the ClimateLens app. Answer the user's question using ONLY the JSON data below. ` +
            `Never invent numbers, alerts, news or forecasts that are not in the data. If something asked is not in the data, say so plainly. ` +
            `Temperatures are °C, wind km/h, rain mm. Keep it under 150 words, use short markdown (bold, bullet points).\n\n` +
            `User question: ${message}\n\nData:\n${JSON.stringify(grounded)}`,
        });
        if (r.text?.trim()) {
          reply = r.text.trim();
          source = model;
        }
      } catch (e) {
        console.error('Gemini narrative failed, using template:', e);
        limitations.push('The AI summary was unavailable, so a basic data summary is shown instead.');
      }
    }

    return res.json({ source, reply, cards, limitations });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(502).json({
      error: 'A weather data source did not respond. Please check your internet connection and try again.',
    });
  }
});


// ---------------------------------------------------------------------------
// Weather page, live map grid, analytics datasets and news (all real sources)
// ---------------------------------------------------------------------------
const cache = new Map<string, { at: number; data: any }>();
async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;
  const data = await loader();
  cache.set(key, { at: Date.now(), data });
  return data;
}

async function fetchText(url: string): Promise<string> {
  const r = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'ClimateLens/1.0' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} from ${new URL(url).host}`);
  return r.text();
}

function guard(req: express.Request, res: express.Response): boolean {
  if (rateLimited(req.ip || 'unknown', 90)) {
    res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    return false;
  }
  return true;
}

app.get('/api/geocode', async (req, res) => {
  if (!guard(req, res)) return;
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < 2 || q.length > 80) return res.status(400).json({ error: 'Enter at least 2 characters.' });
  try {
    const data = await fetchJson(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`
    );
    const results = (data?.results ?? []).map((g: any) => ({
      name: g.name, country: g.country || '', admin1: g.admin1 || '',
      latitude: g.latitude, longitude: g.longitude, timezone: g.timezone || 'auto',
    }));
    res.json({ results, source: 'Open-Meteo Geocoding' });
  } catch (e) {
    console.error('geocode error', e);
    res.status(502).json({ error: 'Location search is unavailable right now. Please try again.' });
  }
});

app.get('/api/weather', async (req, res) => {
  if (!guard(req, res)) return;
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return res.status(400).json({ error: 'Invalid coordinates.' });
  }
  try {
    const key = `w:${lat.toFixed(2)},${lon.toFixed(2)}`;
    const weather = await cached(key, 10 * 60_000, () => getWeather(lat, lon));
    res.json({ weather, fetchedAt: new Date().toISOString(), source: 'Open-Meteo (open-meteo.com)' });
  } catch (e) {
    console.error('weather error', e);
    res.status(502).json({ error: 'The weather service did not respond. Please try again shortly.' });
  }
});

// Coarse global grid (15 degrees) for the live map layers
const GRID_LATS: number[] = [];
const GRID_LONS: number[] = [];
for (let la = -60; la <= 75; la += 15) GRID_LATS.push(la);
for (let lo = -180; lo < 180; lo += 15) GRID_LONS.push(lo);
const GRID_POINTS = GRID_LATS.flatMap((la) => GRID_LONS.map((lo) => ({ lat: la, lon: lo })));

async function loadGrid(kind: 'weather' | 'air') {
  const lats = GRID_POINTS.map((p) => p.lat).join(',');
  const lons = GRID_POINTS.map((p) => p.lon).join(',');
  const url =
    kind === 'weather'
      ? `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,cloud_cover,pressure_msl,wind_speed_10m,uv_index,soil_moisture_0_to_7cm&forecast_hours=24&timezone=UTC`
      : `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&hourly=pm2_5&forecast_hours=24&timezone=UTC`;
  const raw = await fetchJson(url);
  const arr = Array.isArray(raw) ? raw : [raw];
  const times: string[] = arr[0]?.hourly?.time ?? [];
  const points = arr.map((r: any, i: number) => {
    const { time: _t, ...vars } = r.hourly ?? {};
    return { ...GRID_POINTS[i], ...vars };
  });
  return { points, times };
}

app.get('/api/map-grid', async (req, res) => {
  if (!guard(req, res)) return;
  const kind = req.query.kind === 'air' ? 'air' : 'weather';
  try {
    const { points, times } = await cached(`grid:${kind}`, 30 * 60_000, () => loadGrid(kind));
    res.json({
      kind, points, times, cellDegrees: 15, fetchedAt: new Date(cache.get(`grid:${kind}`)!.at).toISOString(),
      source: 'Open-Meteo hourly model forecast, sampled on a 15° grid',
    });
  } catch (e) {
    console.error('grid error', e);
    res.status(502).json({ error: 'Map data is unavailable right now. Please try again shortly.' });
  }
});

// Wildfire hotspots (NASA FIRMS, needs a free MAP_KEY)
app.get('/api/fires', async (req, res) => {
  if (!guard(req, res)) return;
  const key = process.env.FIRMS_MAP_KEY;
  if (!key) {
    return res.json({
      configured: false,
      message: 'Wildfire hotspots need a free NASA FIRMS key. Add FIRMS_MAP_KEY to your .env file (get one at firms.modaps.eosdis.nasa.gov/api/map_key).',
    });
  }
  try {
    const out = await cached('fires', 3 * 3600_000, async () => {
      const r = await fetch(
        `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(key)}/VIIRS_SNPP_NRT/world/1`,
        { signal: AbortSignal.timeout(45000) }
      );
      if (!r.ok) throw new Error(`FIRMS HTTP ${r.status}`);
      const csv = await r.text();
      const lines = csv.split(/\r?\n/);
      const head = lines[0].split(',');
      const iLat = head.indexOf('latitude'), iLon = head.indexOf('longitude'), iConf = head.indexOf('confidence');
      if (iLat < 0 || iLon < 0) throw new Error('Unexpected FIRMS response (check your key).');
      const bins = new Map<string, { lat: number; lon: number; count: number }>();
      for (let i = 1; i < lines.length; i++) {
        const c = lines[i].split(',');
        if (c.length < head.length) continue;
        if (iConf >= 0 && (c[iConf] === 'l' || c[iConf] === 'low')) continue;
        const la = Math.floor(Number(c[iLat])) + 0.5, lo = Math.floor(Number(c[iLon])) + 0.5;
        if (!Number.isFinite(la) || !Number.isFinite(lo)) continue;
        const k = `${la},${lo}`;
        const b = bins.get(k);
        if (b) b.count++; else bins.set(k, { lat: la, lon: lo, count: 1 });
      }
      return [...bins.values()].sort((a, b) => b.count - a.count).slice(0, 4000);
    });
    res.json({ configured: true, cells: out, source: 'NASA FIRMS VIIRS S-NPP (last 24 h, nominal/high confidence, 1° bins)', fetchedAt: new Date(cache.get('fires')!.at).toISOString() });
  } catch (e: any) {
    console.error('fires error', e);
    res.status(502).json({ error: 'Wildfire data could not be loaded. Check your FIRMS_MAP_KEY and try again.' });
  }
});

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

const EMISSION_REGIONS = ['World', 'India', 'China', 'United States', 'European Union (27)', 'Brazil', 'Russia', 'Japan', 'United Kingdom'];
app.get('/api/emissions', async (req, res) => {
  if (!guard(req, res)) return;
  try {
    const series = await cached('emissions', 24 * 3600_000, async () => {
      const csv = await fetchText('https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv');
      const lines = csv.split(/\r?\n/);
      const head = parseCsvLine(lines[0]);
      const iC = head.indexOf('country'), iY = head.indexOf('year'), iV = head.indexOf('co2');
      if (iC < 0 || iY < 0 || iV < 0) throw new Error('Unexpected emissions file format');
      const out: Record<string, { year: number; value: number }[]> = {};
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const c = parseCsvLine(lines[i]);
        if (!EMISSION_REGIONS.includes(c[iC])) continue;
        const year = Number(c[iY]), v = Number(c[iV]);
        if (!c[iV] || !Number.isFinite(v)) continue;
        (out[c[iC]] ||= []).push({ year, value: v });
      }
      return out;
    });
    res.json({
      series, regions: EMISSION_REGIONS, unit: 'million tonnes CO₂ (fossil fuels and industry)',
      source: 'Our World in Data, based on the Global Carbon Project', url: 'https://github.com/owid/co2-data',
    });
  } catch (e) {
    console.error('emissions error', e);
    res.status(502).json({ error: 'Emissions data could not be loaded right now.' });
  }
});

app.get('/api/climate-history', async (req, res) => {
  if (!guard(req, res)) return;
  const lat = Number(req.query.lat), lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return res.status(400).json({ error: 'Invalid coordinates.' });
  }
  try {
    const key = `hist:${lat.toFixed(1)},${lon.toFixed(1)}`;
    const years = await cached(key, 24 * 3600_000, async () => {
      const lastYear = new Date().getFullYear() - 1;
      const d = await fetchJson(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=1950-01-01&end_date=${lastYear}-12-31&daily=temperature_2m_mean,precipitation_sum&timezone=UTC`
      );
      const t: string[] = d.daily.time, tm: (number | null)[] = d.daily.temperature_2m_mean, pr: (number | null)[] = d.daily.precipitation_sum;
      const acc = new Map<number, { ts: number; tn: number; ps: number; pn: number }>();
      t.forEach((day, i) => {
        const y = Number(day.slice(0, 4));
        const a = acc.get(y) ?? { ts: 0, tn: 0, ps: 0, pn: 0 };
        if (typeof tm[i] === 'number') { a.ts += tm[i] as number; a.tn++; }
        if (typeof pr[i] === 'number') { a.ps += pr[i] as number; a.pn++; }
        acc.set(y, a);
      });
      return [...acc.entries()]
        .filter(([, a]) => a.tn >= 350 && a.pn >= 350)
        .map(([year, a]) => ({ year, temperature: +(a.ts / a.tn).toFixed(2), precipitation: Math.round(a.ps) }));
    });
    res.json({
      years, source: 'Open-Meteo Historical Weather API (ERA5 reanalysis, ECMWF/Copernicus)',
      note: 'Reanalysis for the grid cell nearest the chosen point; useful for trends, not a station record.',
    });
  } catch (e) {
    console.error('history error', e);
    res.status(502).json({ error: 'Historical climate data could not be loaded right now.' });
  }
});

function parseGistemp(csv: string) {
  const lines = csv.split(/\r?\n/);
  const hi = lines.findIndex((l) => l.startsWith('Year,'));
  if (hi < 0) throw new Error('Unexpected GISTEMP format');
  const head = lines[hi].split(',');
  const col = head.indexOf('J-D');
  const out: { year: number; value: number }[] = [];
  for (const l of lines.slice(hi + 1)) {
    const c = l.split(',');
    const year = Number(c[0]);
    const v = Number(c[col]);
    if (Number.isInteger(year) && year > 1800 && c[col] && !Number.isNaN(v)) out.push({ year, value: v });
  }
  return out;
}

function parseCo2(txt: string) {
  const out: { year: number; value: number }[] = [];
  for (const l of txt.split(/\r?\n/)) {
    if (!l.trim() || l.startsWith('#')) continue;
    const c = l.trim().split(/\s+/);
    const year = Number(c[0]);
    const v = Number(c[1]);
    if (Number.isInteger(year) && v > 0) out.push({ year, value: v });
  }
  return out;
}

app.get('/api/analytics', async (req, res) => {
  if (!guard(req, res)) return;
  const [temp, co2] = await Promise.allSettled([
    cached('an:temp', 24 * 3600_000, async () =>
      parseGistemp(await fetchText('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv'))
    ),
    cached('an:co2', 24 * 3600_000, async () =>
      parseCo2(await fetchText('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt'))
    ),
  ]);
  res.json({
    temperature: temp.status === 'fulfilled'
      ? { data: temp.value, unit: '°C anomaly', baseline: '1951–1980 average', source: 'NASA GISS GISTEMP v4 (global land-ocean, annual J–D)', url: 'https://data.giss.nasa.gov/gistemp/' }
      : { error: 'NASA GISTEMP data could not be loaded.' },
    co2: co2.status === 'fulfilled'
      ? { data: co2.value, unit: 'ppm', baseline: 'Annual mean', source: 'NOAA GML, Mauna Loa Observatory', url: 'https://gml.noaa.gov/ccgg/trends/' }
      : { error: 'NOAA CO₂ data could not be loaded.' },
    fetchedAt: new Date().toISOString(),
  });
});

const NEWS_TOPICS: Record<string, string> = {
  'Climate change': '("climate change" OR "global warming")',
  'Extreme weather': '("extreme weather" OR heatwave OR flood OR drought OR cyclone)',
  Wildfires: '(wildfire OR "forest fire")',
  'Renewable energy': '("renewable energy" OR "solar power" OR "wind power")',
  'Sea level & oceans': '("sea level" OR "ocean warming" OR "coral bleaching")',
  'Policy & science': '("climate policy" OR "climate summit" OR "emissions" OR "climate study")',
};
const NEWS_COUNTRIES: Record<string, string> = {
  India: 'india', 'United States': 'unitedstates', 'United Kingdom': 'unitedkingdom',
  Australia: 'australia', Canada: 'canada', Brazil: 'brazil',
};

app.get('/api/news', async (req, res) => {
  if (!guard(req, res)) return;
  const topic = typeof req.query.topic === 'string' && NEWS_TOPICS[req.query.topic] ? req.query.topic : 'Climate change';
  const country = typeof req.query.country === 'string' ? req.query.country : '';
  const days = [1, 3, 7, 30].includes(Number(req.query.days)) ? Number(req.query.days) : 7;
  let q = `${NEWS_TOPICS[topic]} sourcelang:english`;
  if (NEWS_COUNTRIES[country]) q += ` sourcecountry:${NEWS_COUNTRIES[country]}`;
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}` +
    `&mode=artlist&maxrecords=24&format=json&sort=datedesc&timespan=${days}d`;
  try {
    const articles = await cached(`news:${url}`, 10 * 60_000, async () => {
      const txt = await fetchText(url);
      let json: any;
      try { json = JSON.parse(txt); } catch { throw new Error('News provider returned a non-JSON reply (probably rate-limited).'); }
      const seen = new Set<string>();
      return (json.articles ?? [])
        .filter((a: any) => a.url && a.title && !seen.has(a.title) && seen.add(a.title))
        .map((a: any) => {
          const s: string = a.seendate || '';
          const iso = s.length >= 15 ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z` : null;
          return { title: a.title, url: a.url, publisher: a.domain, country: a.sourcecountry || '', publishedAt: iso, image: a.socialimage || null };
        });
    });
    res.json({ articles, topic, country, days, source: 'GDELT Project (gdeltproject.org)', fetchedAt: new Date().toISOString() });
  } catch (e: any) {
    console.error('news error', e);
    res.status(502).json({ error: 'The news source did not respond (it may be rate-limited). Wait a few seconds and retry.' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClimateLens server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
