import React from 'react';

interface ClimateLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export const ClimateLogo: React.FC<ClimateLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
  textClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Precision Geometric SVG: Earth sphere + biosphere leaf curve + planetary data orbital lens */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-1.5 ring-1 ring-white/10 shadow-lg shadow-emerald-950/20"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Subtle Outer Data Latitude Grid */}
          <circle
            cx="20"
            cy="20"
            r="16.5"
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            strokeOpacity="0.4"
          />
          {/* Earth Biosphere Meridian Arc */}
          <ellipse
            cx="20"
            cy="20"
            rx="9"
            ry="16.5"
            stroke="#06b6d4"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          <line
            x1="3.5"
            y1="20"
            x2="36.5"
            y2="20"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          {/* Stylized Leaf Silhouette Merged with Globe Core */}
          <path
            d="M20 7C24.5 11.5 28 17.5 25.5 23C23 28.5 16 32 12.5 30C10.5 26.5 12 18 20 7Z"
            fill="url(#climate-grad-leaf)"
            fillOpacity="0.85"
          />
          {/* Central Climate Monitoring Core Node */}
          <circle cx="20" cy="20" r="3" fill="#10b981" />
          <circle cx="20" cy="20" r="1.2" fill="#ffffff" />
          {/* Gradients */}
          <defs>
            <linearGradient id="climate-grad-leaf" x1="12" y1="7" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="0.6" stopColor="#059669" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`text-base font-bold tracking-tight text-white flex items-center gap-1.5 ${textClassName}`}>
            Climate<span className="text-emerald-400">Lens</span>
          </span>
          <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium">
            Observatory
          </span>
        </div>
      )}
    </div>
  );
};
