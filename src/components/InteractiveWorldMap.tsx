import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3Geo from 'd3-geo';
import { worldLandFeature, worldCountriesFeature } from '../services/geoData';
import { ClimateIndicatorId, MapStyleId, RegionData } from '../types/climate';
import { INDICATOR_METAS, REGIONS_DATA } from '../data/climateData';
import {
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Compass,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface InteractiveWorldMapProps {
  selectedIndicator: ClimateIndicatorId;
  onChangeIndicator: (ind: ClimateIndicatorId) => void;
  selectedYear: number;
  onChangeYear: (year: number) => void;
  onSelectRegion?: (region: RegionData) => void;
}

// Major representative geographic stations/countries with true geographic coordinates
interface GeoStation {
  id: string;
  name: string;
  countryCode: string;
  coordinates: [number, number]; // [lng, lat]
  regionId: string;
}

interface ProjectedStation extends GeoStation {
  cx: number;
  cy: number;
}

const GEO_STATIONS_CONFIG: GeoStation[] = [
  { id: 'us-east', name: 'United States', countryCode: 'USA', coordinates: [-98.5, 39.8], regionId: 'us' },
  { id: 'ca-north', name: 'Canada', countryCode: 'CAN', coordinates: [-106.3, 56.1], regionId: 'ca' },
  { id: 'br-amazon', name: 'Brazil', countryCode: 'BRA', coordinates: [-51.9, -14.2], regionId: 'br' },
  { id: 'de-central', name: 'Germany', countryCode: 'DEU', coordinates: [10.4, 51.1], regionId: 'de' },
  { id: 'uk-london', name: 'United Kingdom', countryCode: 'GBR', coordinates: [-3.4, 55.3], regionId: 'uk' },
  { id: 'eg-cairo', name: 'Egypt', countryCode: 'EGY', coordinates: [30.8, 26.8], regionId: 'eg' },
  { id: 'za-cape', name: 'South Africa', countryCode: 'ZAF', coordinates: [22.9, -30.5], regionId: 'za' },
  { id: 'in-delhi', name: 'India', countryCode: 'IND', coordinates: [78.9, 20.5], regionId: 'in' },
  { id: 'cn-beijing', name: 'China', countryCode: 'CHN', coordinates: [104.1, 35.8], regionId: 'cn' },
  { id: 'jp-tokyo', name: 'Japan', countryCode: 'JPN', coordinates: [138.2, 36.2], regionId: 'jp' },
  { id: 'id-jakarta', name: 'Indonesia', countryCode: 'IDN', coordinates: [113.9, -0.7], regionId: 'id' },
  { id: 'au-sydney', name: 'Australia', countryCode: 'AUS', coordinates: [133.7, -25.2], regionId: 'au' },
];

export const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  selectedIndicator,
  onChangeIndicator,
  selectedYear,
  onChangeYear,
  onSelectRegion,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 4x
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapStyle, setMapStyle] = useState<MapStyleId>('observatory');
  const [hoverStation, setHoverStation] = useState<ProjectedStation | null>(null);
  const [activeModalRegion, setActiveModalRegion] = useState<RegionData | null>(null);

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const meta = INDICATOR_METAS[selectedIndicator];

  // D3 Equirectangular projection mapping real geographic geometry
  const projection = useMemo(() => {
    return d3Geo
      .geoEquirectangular()
      .scale(960 / (2 * Math.PI))
      .translate([480, 260]);
  }, []);

  const pathGenerator = useMemo(() => {
    return d3Geo.geoPath(projection);
  }, [projection]);

  const landPath = useMemo(() => {
    return pathGenerator(worldLandFeature) || '';
  }, [pathGenerator]);

  const countriesPath = useMemo(() => {
    return pathGenerator(worldCountriesFeature) || '';
  }, [pathGenerator]);

  // Projected stations with accurate cx, cy
  const stations = useMemo(() => {
    return GEO_STATIONS_CONFIG.map((st) => {
      const coords = projection(st.coordinates) || [480, 260];
      return {
        ...st,
        cx: coords[0],
        cy: coords[1],
      };
    });
  }, [projection]);

  // Benchmark years for quick jumping
  const benchmarkYears = [1880, 1900, 1930, 1960, 1980, 2000, 2015, 2020, 2026];

  // Animation timeline loop
  useEffect(() => {
    if (isPlaying) {
      const interval = 240 / playSpeed;
      animationRef.current = setInterval(() => {
        onChangeYear(
          selectedYear >= 2026 ? 1880 : selectedYear + 1
        );
      }, interval);
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isPlaying, selectedYear, playSpeed, onChangeYear]);

  // Interpolated anomaly calculation for region at given year
  const getStationValue = (station: GeoStation, year: number): number => {
    const region = REGIONS_DATA.find((r) => r.id === station.regionId) || REGIONS_DATA[0];
    const series = region.indicators[selectedIndicator] || REGIONS_DATA[0].indicators[selectedIndicator] || [];
    const pt = series.find((p) => p.year === year);
    return pt ? pt.value : series[series.length - 1]?.value || 0;
  };

  // Dynamic heat coloring based on indicator value and year
  const getStationColor = (val: number): string => {
    const min = meta.minVal;
    const max = meta.maxVal;
    const norm = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));

    if (mapStyle === 'thermal') {
      // Infrared/Thermal heatmap palette (blue -> yellow -> red)
      if (norm < 0.3) return '#3b82f6';
      if (norm < 0.6) return '#eab308';
      if (norm < 0.8) return '#f97316';
      return '#ef4444';
    }

    if (mapStyle === 'risk') {
      // Risk alert palette
      if (norm < 0.3) return '#10b981';
      if (norm < 0.6) return '#eab308';
      if (norm < 0.8) return '#f97316';
      return '#dc2626';
    }

    // Default Observatory palette: subtle emerald / cyan / amber / ruby
    if (meta.higherIsWorse) {
      if (norm < 0.4) return '#06b6d4';
      if (norm < 0.7) return '#f59e0b';
      return '#ef4444';
    } else {
      if (norm < 0.4) return '#ef4444';
      if (norm < 0.7) return '#f59e0b';
      return '#10b981';
    }
  };

  const handleStationClick = (station: GeoStation) => {
    const region = REGIONS_DATA.find((r) => r.id === station.regionId);
    if (region) {
      setActiveModalRegion(region);
      if (onSelectRegion) onSelectRegion(region);
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.8, Math.min(2.5, prev + delta)));
  };

  const handleResetMap = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="w-full rounded-2xl bg-surface-1 border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col space-y-4 p-4 sm:p-6">
      {/* Top Map Toolbar: Indicator Selector & Style Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        {/* Indicator Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(INDICATOR_METAS) as ClimateIndicatorId[]).map((indKey) => {
            const item = INDICATOR_METAS[indKey];
            const isActive = selectedIndicator === indKey;
            return (
              <button
                key={indKey}
                onClick={() => onChangeIndicator(indKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-md ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: item.color }}
                />
                {item.shortName}
              </button>
            );
          })}
        </div>

        {/* Map Projection Style Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs">
          <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Style:
          </span>
          {[
            { id: 'observatory' as MapStyleId, label: 'Observatory' },
            { id: 'thermal' as MapStyleId, label: 'Thermal' },
            { id: 'topographic' as MapStyleId, label: 'Topo' },
            { id: 'risk' as MapStyleId, label: 'Risk' },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setMapStyle(style.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                mapStyle === style.id
                  ? 'bg-slate-800 text-emerald-300 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas Area with SVG */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[600px] rounded-xl bg-surface-0 border border-slate-900 overflow-hidden flex items-center justify-center">
        {/* Floating Zoom & Pan Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-lg backdrop-blur-md shadow-lg">
          <button
            onClick={() => handleZoom(0.25)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetMap}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
            title="Reset Map View"
            aria-label="Reset map view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Top Left Indicator HUD Card */}
        <div className="absolute top-4 left-4 z-20 rounded-xl bg-slate-900/90 border border-slate-800/90 p-3 backdrop-blur-md max-w-xs shadow-xl text-xs space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-white">{meta.name}</span>
            <span className="font-mono text-emerald-400 font-bold">{selectedYear}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">{meta.description}</p>
          <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>Baseline: {meta.baseline}</span>
          </div>
        </div>

        {/* Bottom Left Legend */}
        <div className="absolute bottom-4 left-4 z-20 rounded-lg bg-slate-900/85 border border-slate-800 p-2.5 backdrop-blur-md shadow-lg text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>Low ({meta.minVal} {meta.unit})</span>
            <span>High ({meta.maxVal} {meta.unit})</span>
          </div>
          <div className="w-44 h-2 rounded bg-gradient-to-r from-cyan-500 via-amber-400 to-red-500 shadow-inner" />
          <div className="text-[10px] text-slate-400 text-center">
            Modeled Observatory Metric Graticule
          </div>
        </div>

        {/* SVG World Map */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          <svg
            viewBox="0 0 960 520"
            className="w-full h-full max-w-full max-h-full overflow-visible"
          >
            {/* Latitude & Longitude Graticule Grid */}
            <g opacity="0.15" stroke="#38bdf8" strokeWidth="0.8">
              {/* Parallels (Latitudes) */}
              <line x1="40" y1="90" x2="920" y2="90" strokeDasharray="3 3" /> {/* 60°N Arctic Circle */}
              <line x1="40" y1="170" x2="920" y2="170" strokeDasharray="2 4" /> {/* 23.5°N Tropic of Cancer */}
              <line x1="40" y1="260" x2="920" y2="260" strokeWidth="1.2" /> {/* Equator */}
              <line x1="40" y1="350" x2="920" y2="350" strokeDasharray="2 4" /> {/* 23.5°S Tropic of Capricorn */}
              <line x1="40" y1="440" x2="920" y2="440" strokeDasharray="3 3" /> {/* 60°S Antarctic Circle */}

              {/* Meridians (Longitudes) */}
              <line x1="240" y1="40" x2="240" y2="480" strokeDasharray="2 4" />
              <line x1="480" y1="40" x2="480" y2="480" strokeWidth="1" /> {/* Prime Meridian */}
              <line x1="720" y1="40" x2="720" y2="480" strokeDasharray="2 4" />
            </g>

            {/* Real Geographic Land Base */}
            <path
              d={landPath}
              fill={
                mapStyle === 'topographic'
                  ? '#0b1626'
                  : mapStyle === 'thermal'
                  ? '#0a101f'
                  : '#081120'
              }
              stroke={
                mapStyle === 'topographic'
                  ? '#1e3a5f'
                  : '#1e293b'
              }
              strokeWidth="1.2"
              className="transition-colors duration-300"
            />

            {/* Sovereign Country Boundaries */}
            <path
              d={countriesPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="0.55"
              className="transition-colors duration-300"
            />

            {/* Glowing Coastlines */}
            <path
              d={landPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.1"
              strokeOpacity="0.75"
              className="pointer-events-none"
            />

            {/* Geo Observation Stations / Country Hotspots */}
            {stations.map((station) => {
              const val = getStationValue(station, selectedYear);
              const color = getStationColor(val);
              const isHovered = hoverStation?.id === station.id;

              return (
                <g
                  key={station.id}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoverStation(station)}
                  onMouseLeave={() => setHoverStation(null)}
                  onClick={() => handleStationClick(station)}
                >
                  {/* Outer pulsating wave ring */}
                  <circle
                    cx={station.cx}
                    cy={station.cy}
                    r={isHovered ? 18 : 12}
                    fill={color}
                    opacity={isHovered ? 0.35 : 0.15}
                    className="transition-all duration-300"
                  />

                  {/* Core Station Node */}
                  <circle
                    cx={station.cx}
                    cy={station.cy}
                    r={isHovered ? 7 : 5}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2 : 1.2}
                    className="transition-all duration-200"
                  />

                  {/* Station label */}
                  <text
                    x={station.cx}
                    y={station.cy - 10}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="10"
                    fontWeight="600"
                    className="select-none pointer-events-none drop-shadow"
                  >
                    {station.countryCode}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Station Floating Card */}
        {hoverStation && (
          <div
            className="absolute z-30 pointer-events-none rounded-xl bg-slate-900/95 border border-slate-700/80 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 transition-all"
            style={{
              left: `${(hoverStation.cx / 960) * 100}%`,
              top: `${(hoverStation.cy / 520) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="flex items-center justify-between gap-4 font-mono pb-1 border-b border-slate-800 text-[11px]">
              <span className="text-white font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                {hoverStation.name}
              </span>
              <span className="text-slate-400">{selectedYear}</span>
            </div>

            <div className="flex items-center justify-between gap-4 font-mono">
              <span className="text-slate-400">{meta.shortName}:</span>
              <span className="font-bold text-emerald-300">
                {meta.kpiFormat(getStationValue(hoverStation, selectedYear))}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 pt-0.5">
              Click node to inspect country risk profile
            </div>
          </div>
        )}
      </div>

      {/* Bottom Timeline Controls & Playback Slider */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-4 space-y-3">
        {/* Play/Pause & Year scrubber */}
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isPlaying
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
            }`}
            title={isPlaying ? 'Pause Timeline' : 'Play Timeline (1880–2026)'}
            aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {/* Current Year Display */}
          <div className="flex flex-col shrink-0 font-mono">
            <span className="text-[10px] uppercase text-slate-400">Model Year</span>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {selectedYear}
            </span>
          </div>

          {/* Continuous Timeline Range Slider */}
          <div className="flex-1 px-2">
            <input
              type="range"
              min={1880}
              max={2026}
              value={selectedYear}
              onChange={(e) => onChangeYear(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Playback speed toggle */}
          <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-1 text-xs font-mono text-slate-300">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaySpeed(spd)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  playSpeed === spd ? 'bg-slate-700 text-emerald-300 font-bold' : 'hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Benchmark Historical Milestones Buttons */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1 overflow-x-auto gap-2">
          {benchmarkYears.map((yr) => (
            <button
              key={yr}
              onClick={() => onChangeYear(yr)}
              className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                selectedYear === yr
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Modal Quick Inspector if Station clicked */}
      {activeModalRegion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-surface-1 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Planetary Station Node
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  {activeModalRegion.name} ({activeModalRegion.code})
                </h3>
              </div>
              <button
                onClick={() => setActiveModalRegion(null)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Current Indicator</span>
                <span className="text-emerald-400 text-sm font-semibold">
                  {meta.kpiFormat(
                    activeModalRegion.indicators[selectedIndicator]?.find(
                      (p) => p.year === selectedYear
                    )?.value || 0
                  )}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Overall Climate Risk</span>
                <span className="text-orange-400 text-sm font-semibold">
                  {activeModalRegion.risk.overallScore} / 10
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <span className="font-semibold text-slate-200">Vulnerability Assessment:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {activeModalRegion.risk.vulnerabilityFactor}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModalRegion(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
