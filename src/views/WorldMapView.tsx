import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as d3Geo from 'd3-geo';
import { worldLandFeature, worldCountriesFeature } from '../services/geoData';
import { INDICATOR_METAS, REGIONS_DATA, getRegionById } from '../data/climateData';
import { ClimateIndicatorId } from '../types/climate';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  ChevronDown,
  Layers,
  MapPin,
  TrendingUp,
  Info,
} from 'lucide-react';

interface WorldMapViewProps {
  onNavigateToCompareWithRegion?: (regionId: string) => void;
  onNavigateToExplorerWithIndicator?: (indicator: ClimateIndicatorId) => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = () => {
  const [selectedIndicator, setSelectedIndicator] = useState<ClimateIndicatorId>('temperature');
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [mapStyle, setMapStyle] = useState<'Heat Map' | 'Satellite' | 'Terrain'>('Heat Map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    value: string;
    anomaly: string;
  } | null>(null);

  const handleSelectRegion = (regionKey: string) => {
    setSelectedRegion(regionKey);
    switch (regionKey) {
      case 'na':
        setZoomLevel(1.6);
        setPanOffset({ x: 120, y: 40 });
        break;
      case 'sa':
        setZoomLevel(1.6);
        setPanOffset({ x: 100, y: -100 });
        break;
      case 'eu':
        setZoomLevel(2.0);
        setPanOffset({ x: -10, y: 60 });
        break;
      case 'af':
        setZoomLevel(1.6);
        setPanOffset({ x: -15, y: -30 });
        break;
      case 'as':
        setZoomLevel(1.6);
        setPanOffset({ x: -140, y: 30 });
        break;
      case 'oc':
        setZoomLevel(1.7);
        setPanOffset({ x: -180, y: -90 });
        break;
      case 'an':
        setZoomLevel(1.6);
        setPanOffset({ x: 0, y: -140 });
        break;
      case 'in':
        setZoomLevel(2.2);
        setPanOffset({ x: -130, y: -10 });
        break;
      case 'us':
        setZoomLevel(2.0);
        setPanOffset({ x: 130, y: 40 });
        break;
      case 'cn':
        setZoomLevel(2.0);
        setPanOffset({ x: -150, y: 30 });
        break;
      case 'br':
        setZoomLevel(2.0);
        setPanOffset({ x: 100, y: -100 });
        break;
      case 'de':
        setZoomLevel(2.4);
        setPanOffset({ x: -10, y: 60 });
        break;
      default:
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        break;
    }
  };

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const meta = INDICATOR_METAS[selectedIndicator] || INDICATOR_METAS.temperature;

  // Timeline animation player
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        setSelectedYear((prev) => (prev >= 2026 ? 1880 : prev + 2));
      }, 300);
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isPlaying]);

  // D3 Equirectangular projection mapping real world geometry
  const width = 960;
  const height = 480;

  const projection = useMemo(() => {
    return d3Geo
      .geoEquirectangular()
      .scale(width / (2 * Math.PI))
      .translate([width / 2, height / 2]);
  }, [width, height]);

  const pathGenerator = useMemo(() => {
    return d3Geo.geoPath(projection);
  }, [projection]);

  // Country paths precalculated with real Natural Earth boundaries
  const countryPaths = useMemo(() => {
    return worldCountriesFeature.features.map((country: any, idx: number) => {
      const d = pathGenerator(country) || '';
      return {
        id: country.id || `c-${idx}`,
        feature: country,
        d,
      };
    });
  }, [pathGenerator]);

  const landPath = useMemo(() => {
    return pathGenerator(worldLandFeature) || '';
  }, [pathGenerator]);

  // Compute thermal climate color for each country based on indicator & year
  const getCountryClimateColor = (country: any): string => {
    // Extract centroid latitude to simulate realistic climate physics
    let lat = 20;
    try {
      const centroid = d3Geo.geoCentroid(country);
      lat = centroid[1];
    } catch {
      lat = 20;
    }
    const absLat = Math.abs(lat);

    const yearFactor = (selectedYear - 1970) / 55; // 0.18 to 1.0

    if (mapStyle === 'Satellite') {
      return '#0e2b20';
    }
    if (mapStyle === 'Terrain') {
      return '#1a3325';
    }

    // Heat Map mode - color depends on selected indicator
    if (selectedIndicator === 'temperature' || selectedIndicator === 'extreme_heat') {
      // Warmest at tropical/subtropical belts + high Arctic amplification
      let anomaly = (absLat < 30 ? 1.4 : absLat > 60 ? 1.8 : 1.1) * yearFactor;
      if (anomaly < 0.2) return '#0284c7'; // Cold blue
      if (anomaly < 0.6) return '#06b6d4'; // Cool cyan
      if (anomaly < 1.0) return '#10b981'; // Green neutral
      if (anomaly < 1.4) return '#eab308'; // Warm yellow
      if (anomaly < 1.8) return '#f97316'; // Hot orange
      return '#ef4444'; // Extreme Red
    }

    if (selectedIndicator === 'co2') {
      const factor = (selectedYear - 1880) / 146;
      if (factor < 0.3) return '#0891b2';
      if (factor < 0.6) return '#059669';
      if (factor < 0.85) return '#d97706';
      return '#dc2626';
    }

    if (selectedIndicator === 'precipitation') {
      return absLat < 20 ? '#0284c7' : absLat < 40 ? '#f59e0b' : '#10b981';
    }

    if (selectedIndicator === 'sea_level') {
      return '#3b82f6';
    }

    if (selectedIndicator === 'arctic_ice') {
      return absLat > 65 ? '#38bdf8' : '#064e3b';
    }

    if (selectedIndicator === 'forest_cover') {
      return absLat < 25 ? '#059669' : '#15803d';
    }

    // Default Climate Risk
    const riskFactor = absLat < 35 ? '#ea580c' : '#eab308';
    return riskFactor;
  };

  // Country name lookup helper
  const getCountryName = (country: any): string => {
    const numericId = parseInt(country.id, 10);
    // Common country codes
    const map: Record<number, string> = {
      840: 'United States',
      356: 'India',
      156: 'China',
      276: 'Germany',
      76: 'Brazil',
      36: 'Australia',
      124: 'Canada',
      826: 'United Kingdom',
      392: 'Japan',
      710: 'South Africa',
      818: 'Egypt',
      360: 'Indonesia',
      250: 'France',
      380: 'Italy',
      643: 'Russia',
      484: 'Mexico',
      32: 'Argentina',
    };
    return map[numericId] || `Region #${country.id}`;
  };

  const handleCountryHover = (country: any) => {
    const name = getCountryName(country);
    const yrFactor = ((selectedYear - 1970) / 55) * 1.24;
    setHoveredCountry({
      name,
      value: meta.kpiFormat(yrFactor),
      anomaly: selectedYear >= 2000 ? `+${(yrFactor * 0.8).toFixed(2)} vs pre-industrial` : 'Baseline period',
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header matching reference */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Interactive World Map
        </h1>
        <p className="text-xs text-slate-400">
          Visualize climate data across the globe with multiple indicators and time periods.
        </p>
      </div>

      {/* Main Container: Real Geographic World Map + Controls Panel matching reference */}
      <div className="rounded-3xl bg-surface-1 border border-slate-800/90 p-5 lg:p-6 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* World Map Canvas (lg:col-span-9) */}
        <div className="lg:col-span-9 relative w-full aspect-[16/9] min-h-[380px] max-h-[600px] rounded-2xl bg-surface-0 border border-slate-900 overflow-hidden flex items-center justify-center">
          {/* Zoom Controls on Bottom Left matching reference */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-lg">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.25))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Real Geographic SVG World Map */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible font-mono">
              {/* Oceanic Graticule Lines */}
              <g stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.8">
                <line x1="40" y1="80" x2="920" y2="80" strokeDasharray="3 3" />
                <line x1="40" y1="160" x2="920" y2="160" strokeDasharray="2 4" />
                <line x1="40" y1="240" x2="920" y2="240" strokeWidth="1.2" />
                <line x1="40" y1="320" x2="920" y2="320" strokeDasharray="2 4" />
                <line x1="40" y1="400" x2="920" y2="400" strokeDasharray="3 3" />
                <line x1="240" y1="40" x2="240" y2="440" strokeDasharray="2 4" />
                <line x1="480" y1="40" x2="480" y2="440" />
                <line x1="720" y1="40" x2="720" y2="440" strokeDasharray="2 4" />
              </g>

              {/* Real Geographic Land Base */}
              <path
                d={landPath}
                fill="#071b16"
                stroke="rgba(52, 211, 153, 0.4)"
                strokeWidth="0.8"
              />

              {/* Real Countries Features with Climate Heatmap Colors */}
              {countryPaths.map((item: { id: string; feature: any; d: string }) => {
                const color = getCountryClimateColor(item.feature);
                return (
                  <path
                    key={item.id}
                    d={item.d}
                    fill={color}
                    fillOpacity={0.88}
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="0.6"
                    className="cursor-pointer transition-all hover:stroke-white hover:stroke-[1.2] hover:fill-opacity-100"
                    onMouseEnter={() => handleCountryHover(item.feature)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                );
              })}

              {/* Real Outer Coastline Glow Stroke */}
              <path
                d={landPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.2"
                strokeOpacity="0.85"
                className="pointer-events-none"
              />
            </svg>
          </div>

          {/* Interactive Hover Tooltip Overlay */}
          {hoveredCountry && (
            <div className="absolute top-4 left-4 z-20 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-slate-700 text-xs font-mono backdrop-blur-md shadow-2xl space-y-0.5">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{hoveredCountry.name}</span>
              </div>
              <div className="text-emerald-400 font-semibold text-sm">
                {meta.shortName}: {hoveredCountry.value}
              </div>
              <div className="text-[10px] text-slate-400">
                {hoveredCountry.anomaly} ({selectedYear})
              </div>
            </div>
          )}
        </div>

        {/* Right Control Panel (lg:col-span-3) matching reference */}
        <div className="lg:col-span-3 space-y-5">
          {/* Select Region Focus */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Region Focus
            </label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => handleSelectRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none appearance-none cursor-pointer pr-8 font-medium"
              >
                <option value="global">Global View (All Continents)</option>
                <option value="na">North America</option>
                <option value="sa">South America</option>
                <option value="eu">Europe</option>
                <option value="af">Africa</option>
                <option value="as">Asia</option>
                <option value="oc">Australia & Oceania</option>
                <option value="an">Antarctica</option>
                <option value="in">India</option>
                <option value="us">United States</option>
                <option value="cn">China</option>
                <option value="br">Brazil</option>
                <option value="de">Germany</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Select Indicator */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Indicator
            </label>
            <div className="relative">
              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value as ClimateIndicatorId)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none appearance-none cursor-pointer pr-8 font-medium"
              >
                <option value="temperature">Temperature (°C)</option>
                <option value="co2">CO₂ Concentration</option>
                <option value="precipitation">Precipitation</option>
                <option value="sea_level">Sea Level Rise</option>
                <option value="arctic_ice">Arctic Ice</option>
                <option value="forest_cover">Forest Cover</option>
                <option value="extreme_heat">Extreme Heat</option>
                <option value="climate_risk">Climate Risk</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Select Year & Timeline Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Select Year
              </label>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none appearance-none cursor-pointer pr-8 font-mono"
              >
                <option value={2026}>2026 (Modern Baseline)</option>
                <option value={2020}>2020</option>
                <option value={2010}>2010</option>
                <option value={2000}>2000</option>
                <option value={1980}>1980</option>
                <option value={1950}>1950</option>
                <option value={1900}>1900</option>
                <option value={1880}>1880</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            <div className="pt-2">
              <input
                type="range"
                min={1880}
                max={2026}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>1880</span>
                <span className="text-emerald-400 font-bold">{selectedYear}</span>
                <span>2026</span>
              </div>
            </div>
          </div>

          {/* Map Style Radios matching reference */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Map Style
            </label>
            <div className="space-y-2 text-xs">
              {(['Satellite', 'Heat Map', 'Terrain'] as const).map((style) => (
                <label
                  key={style}
                  onClick={() => setMapStyle(style)}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      mapStyle === style
                        ? 'border-emerald-400 bg-emerald-500'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {mapStyle === style && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </span>
                  <span>{style}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Horizontal Color Scale Legend matching reference */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block">
              °C Temperature Anomaly
            </span>
            <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 via-yellow-400 via-orange-500 to-red-600 shadow-inner" />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>-4</span>
              <span>0</span>
              <span>2</span>
              <span>4+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
