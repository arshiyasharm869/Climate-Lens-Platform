export async function getJson<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export interface GeoResult {
  name: string;
  country: string;
  admin1: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export const placeLabel = (g: { name: string; admin1?: string; country?: string }) =>
  [g.name, g.admin1, g.country].filter(Boolean).join(', ');

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}
