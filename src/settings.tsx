import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type TempUnit = 'C' | 'F';
export type DistUnit = 'km' | 'mi';

export interface Settings {
  theme: ThemeMode;
  accent: string;
  compact: boolean;
  animations: boolean;
  tempUnit: TempUnit;
  distUnit: DistUnit;
  globeRotate: boolean;
  globeLabels: boolean;
  globeNight: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  accent: '#00c853',
  compact: false,
  animations: true,
  tempUnit: 'C',
  distUnit: 'km',
  globeRotate: true,
  globeLabels: true,
  globeNight: true,
};

const STORAGE_KEY = 'climatelens.settings.v1';

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable: fall back to defaults */
  }
  return DEFAULT_SETTINGS;
}

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  resolvedTheme: 'light' | 'dark';
}

const SettingsContext = createContext<Ctx | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(load);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', resolvedTheme === 'light');
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.classList.toggle('compact', settings.compact);
    root.classList.toggle('no-anim', !settings.animations);
    root.style.setProperty('--accent', settings.accent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings, resolvedTheme]);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      resolvedTheme,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      reset: () => setSettings(DEFAULT_SETTINGS),
    }),
    [settings, resolvedTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

export const toDisplayTemp = (c: number, unit: TempUnit) =>
  unit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c);
export const toDisplaySpeed = (kmh: number, unit: DistUnit) =>
  unit === 'mi' ? Math.round(kmh * 0.621371) : Math.round(kmh);
export const speedLabel = (unit: DistUnit) => (unit === 'mi' ? 'mph' : 'km/h');
