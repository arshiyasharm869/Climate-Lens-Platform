import React, { useState } from 'react';

export interface ChartPoint {
  x: number;
  y: number;
  label?: string;
}

interface Props {
  points: ChartPoint[];
  unit: string;
  color?: string;
  height?: number;
  xFormat?: (x: number) => string;
  yFormat?: (y: number) => string;
  zeroLine?: boolean;
  area?: boolean;
  ariaLabel: string;
}

export const SimpleLineChart: React.FC<Props> = ({
  points, unit, color = 'var(--accent)', height = 240, xFormat = (x) => String(x),
  yFormat = (y) => y.toFixed(1), zeroLine = false, area = true, ariaLabel,
}) => {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length < 2) return <div className="text-xs text-slate-400">Not enough data to draw a chart.</div>;

  const W = 760, H = height, L = 46, R = 12, T = 12, B = 28;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  let yMin = Math.min(...ys), yMax = Math.max(...ys);
  if (zeroLine) { yMin = Math.min(yMin, 0); yMax = Math.max(yMax, 0); }
  const pad = (yMax - yMin) * 0.08 || 1;
  yMin -= pad; yMax += pad;
  const sx = (x: number) => L + ((x - xMin) / (xMax - xMin || 1)) * (W - L - R);
  const sy = (y: number) => T + (1 - (y - yMin) / (yMax - yMin || 1)) * (H - T - B);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const areaPath = `${line} L${sx(xMax)},${H - B} L${sx(xMin)},${H - B} Z`;
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);
  const xTicks = Array.from({ length: 6 }, (_, i) => xMin + ((xMax - xMin) * i) / 5);
  const hp = hover != null ? points[hover] : null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = xMin + (((e.clientX - r.left) / r.width) * W - L) / (W - L - R) * (xMax - xMin);
    let best = 0, d = Infinity;
    points.forEach((p, i) => { const dd = Math.abs(p.x - x); if (dd < d) { d = dd; best = i; } });
    setHover(best);
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={ariaLabel}
        onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={L} x2={W - R} y1={sy(t)} y2={sy(t)} stroke="currentColor" className="text-slate-700" strokeWidth="0.6" strokeDasharray="3 4" />
            <text x={L - 6} y={sy(t) + 3} textAnchor="end" className="fill-slate-400" fontSize="10">{yFormat(t)}</text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text key={i} x={sx(t)} y={H - 8} textAnchor="middle" className="fill-slate-400" fontSize="10">{xFormat(Math.round(t))}</text>
        ))}
        {zeroLine && <line x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} stroke="currentColor" className="text-slate-400" strokeWidth="1" />}
        {area && <path d={areaPath} fill={color} opacity="0.12" />}
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {hp && (
          <g>
            <line x1={sx(hp.x)} x2={sx(hp.x)} y1={T} y2={H - B} stroke={color} strokeWidth="1" opacity="0.5" />
            <circle cx={sx(hp.x)} cy={sy(hp.y)} r="4" fill={color} />
          </g>
        )}
      </svg>
      {hp && (
        <div className="absolute top-1 right-2 px-2.5 py-1.5 rounded-lg bg-surface-1 border border-slate-800 text-[11px] text-slate-200 shadow-md pointer-events-none">
          <span className="font-semibold">{hp.label ?? xFormat(hp.x)}</span>: <span className="font-mono">{yFormat(hp.y)} {unit}</span>
        </div>
      )}
    </div>
  );
};
