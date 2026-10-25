import React from 'react';
import { useSettings, ThemeMode } from '../settings';
import { Sun, Moon, Monitor, RotateCcw } from 'lucide-react';

const ACCENTS = [
  { name: 'Emerald', value: '#00c853' },
  { name: 'Ocean', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Teal', value: '#14b8a6' },
];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-3xl bg-surface-1 border border-slate-800 p-5 sm:p-6 space-y-4">
    <h2 className="text-sm font-bold text-white">{title}</h2>
    {children}
  </section>
);

const Segmented = <T extends string>({
  value, options, onChange, label,
}: {
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) => (
  <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-surface-2 border border-slate-800 p-1 gap-1">
    {options.map((o) => (
      <button
        key={o.value}
        role="radio"
        aria-checked={value === o.value}
        onClick={() => onChange(o.value)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          value === o.value ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
        }`}
      >
        {o.icon}{o.label}
      </button>
    ))}
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }> = ({ checked, onChange, label, hint }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-700'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} style={{ backgroundColor: '#fff' }} />
    </button>
  </div>
);

export const SettingsView: React.FC = () => {
  const { settings, update, reset } = useSettings();
  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-2xl space-y-5 pb-16">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-slate-400">Appearance and units. Saved automatically in this browser.</p>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-1 border border-slate-800 text-slate-300 hover:border-emerald-500/50">
          <RotateCcw className="w-3.5 h-3.5" /> Reset to default
        </button>
      </div>

      <Section title="Theme">
        <Segmented label="Theme" value={settings.theme} options={themeOptions} onChange={(theme) => update({ theme })} />
      </Section>

      <Section title="Accent colour">
        <div className="flex flex-wrap items-center gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              onClick={() => update({ accent: a.value })}
              aria-label={`${a.name} accent`}
              title={a.name}
              className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${
                settings.accent.toLowerCase() === a.value ? 'border-slate-200 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: a.value }}
            />
          ))}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="color"
              value={settings.accent}
              onChange={(e) => update({ accent: e.target.value })}
              className="w-9 h-9 rounded-full bg-transparent border border-slate-700 cursor-pointer"
              aria-label="Custom accent colour"
            />
            Custom
          </label>
        </div>
      </Section>

      <Section title="Interface">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-200">Density</span>
            <Segmented
              label="Density"
              value={settings.compact ? 'compact' : 'comfortable'}
              options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}
              onChange={(v) => update({ compact: v === 'compact' })}
            />
          </div>
          <Toggle label="Animations & effects" hint="Turn off for a calmer, faster interface" checked={settings.animations} onChange={(animations) => update({ animations })} />
        </div>
      </Section>

      <Section title="Globe appearance">
        <div className="space-y-4">
          <Toggle label="Auto-rotate" hint="Slowly spin the 3D Earth" checked={settings.globeRotate} onChange={(globeRotate) => update({ globeRotate })} />
          <Toggle label="Place labels" hint="Continents, countries and cities (more appear as you zoom in)" checked={settings.globeLabels} onChange={(globeLabels) => update({ globeLabels })} />
          <Toggle label="Day / night shading" hint="Shows city lights on the night side using the current UTC time" checked={settings.globeNight} onChange={(globeNight) => update({ globeNight })} />
        </div>
      </Section>

      <Section title="Units">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-200">Temperature</span>
            <Segmented label="Temperature unit" value={settings.tempUnit} options={[{ value: 'C', label: '°C' }, { value: 'F', label: '°F' }]} onChange={(tempUnit) => update({ tempUnit })} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-200">Distance & speed</span>
            <Segmented label="Distance unit" value={settings.distUnit} options={[{ value: 'km', label: 'Kilometres' }, { value: 'mi', label: 'Miles' }]} onChange={(distUnit) => update({ distUnit })} />
          </div>
          <p className="text-[11px] text-slate-400">Units currently apply to the Climate AI chat. The older data pages keep their original units.</p>
        </div>
      </Section>
    </div>
  );
};
