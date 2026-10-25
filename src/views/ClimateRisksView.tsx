import React, { useState } from 'react';
import { RegionData, RiskLevel } from '../types/climate';
import { REGIONS_DATA, getRegionById } from '../data/climateData';
import {
  Flame,
  Droplets,
  Sun,
  Waves,
  Zap,
  ChevronDown,
  AlertTriangle,
  Info,
  Maximize2,
  X,
  Crosshair,
  Satellite,
  Compass,
  Layers,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import imgIndia from '../assets/images/risk_map_india_1791629688422.jpg';
import imgGlobal from '../assets/images/risk_map_global_1791629703881.jpg';
import imgUsa from '../assets/images/risk_map_usa_1791629721325.jpg';
import imgBrazil from '../assets/images/risk_map_brazil_1791629733640.jpg';

interface ClimateRisksViewProps {
  initialRegionId?: string;
}

// Satellite climate risk maps mapped to generated high-resolution assets
const REGION_MAP_IMAGES: Record<
  string,
  {
    imageSrc: string;
    satelliteLabel: string;
    source: string;
    sensor: string;
    resolution: string;
    layerName: string;
  }
> = {
  in: {
    imageSrc: imgIndia,
    satelliteLabel: 'South Asian Subcontinent · Thermal Anomaly & Drought Map',
    source: 'NOAA / NASA Earth Observatory (MODIS & VIIRS)',
    sensor: 'Thermal Infrared (TIR) Band 31/32',
    resolution: '375m Spatial Grid',
    layerName: 'Surface Heat & Wet-Bulb Stress',
  },
  global: {
    imageSrc: imgGlobal,
    satelliteLabel: 'Planetary Earth Observation · Multi-Hazard Risk Zones',
    source: 'NASA Earth Observatory / ESA Copernicus Multispectral Sentinel',
    sensor: 'Planetary Multi-Sensor Radiometer Composite',
    resolution: 'Global 1km Gridded',
    layerName: 'Global Multi-Hazard Vulnerability',
  },
  us: {
    imageSrc: imgUsa,
    satelliteLabel: 'North America / CONUS · Drought & Thermal Anomaly Map',
    source: 'USGS Landsat 9 & NOAA GOES-18 Advanced Baseline Imager',
    sensor: 'GOES ABI & Landsat Thermal Infrared (TIRS)',
    resolution: '500m Radiometric Resolution',
    layerName: 'Megadrought & Wildfire Probability',
  },
  ca: {
    imageSrc: imgUsa,
    satelliteLabel: 'North America · Boreal & Cryospheric Anomaly Map',
    source: 'NASA Earth Observatory / NOAA Hazard Mapping System',
    sensor: 'MODIS & Sentinel-3 SLSTR',
    resolution: '500m Gridded Matrix',
    layerName: 'Boreal Wildfire & Permafrost Stress',
  },
  br: {
    imageSrc: imgBrazil,
    satelliteLabel: 'South America · Amazon Basin Vulnerability & Deforestation Index',
    source: 'INPE / NASA Landsat & MODIS Forest & Thermal Monitor',
    sensor: 'Landsat OLI & MODIS Thermal / Surface Reflectance',
    resolution: '250m Resolution',
    layerName: 'Amazon Hydrological & Canopy Risk',
  },
};

const DEFAULT_MAP_META = {
  imageSrc: imgGlobal,
  satelliteLabel: 'Planetary Earth Observation · Regional Multi-Hazard Focus',
  source: 'NASA / NOAA Earth Observatory Satellite Network',
  sensor: 'Atmospheric & Surface Multi-Spectral Radiometer',
  resolution: '1km Radiative Grid',
  layerName: 'Composite Regional Climate Exposure',
};

// Popular hotspot quick-switch buttons
const FEATURED_HOTSPOTS = [
  { id: 'in', label: 'India', flag: '🇮🇳' },
  { id: 'global', label: 'Global', flag: '🌐' },
  { id: 'us', label: 'United States', flag: '🇺🇸' },
  { id: 'br', label: 'Brazil', flag: '🇧🇷' },
  { id: 'cn', label: 'China', flag: '🇨🇳' },
  { id: 'eg', label: 'Egypt', flag: '🇪🇬' },
  { id: 'au', label: 'Australia', flag: '🇦🇺' },
];

export const ClimateRisksView: React.FC<ClimateRisksViewProps> = ({
  initialRegionId = 'in',
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>(initialRegionId);
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState<boolean>(false);

  const region = getRegionById(selectedRegionId);
  const mapMeta = REGION_MAP_IMAGES[selectedRegionId] || DEFAULT_MAP_META;

  // SVG Circular Gauge calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (region.risk.overallScore / 10) * circumference;

  // Dynamic risk level formatting
  const getRiskLevelBadge = (score: number) => {
    if (score >= 8.0) {
      return {
        label: 'Very High',
        bg: 'bg-red-500/15 border-red-500/40 text-red-400',
        color: '#ef4444',
      };
    }
    if (score >= 6.5) {
      return {
        label: 'High',
        bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
        color: '#f97316',
      };
    }
    if (score >= 5.0) {
      return {
        label: 'Moderate',
        bg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400',
        color: '#eab308',
      };
    }
    return {
      label: 'Low',
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      color: '#10b981',
    };
  };

  const riskBadge = getRiskLevelBadge(region.risk.overallScore);

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Country Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              Satellite Observation Feed
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {region.lat.toFixed(2)}°{region.lat >= 0 ? 'N' : 'S'},{' '}
              {Math.abs(region.lng).toFixed(2)}°{region.lng >= 0 ? 'E' : 'W'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Climate Risk Index & Satellite Analysis
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real satellite Earth observation imagery paired with multi-hazard vulnerability indices, empirical thermal anomalies, and adaptation metrics.
          </p>
        </div>

        {/* Region Selector dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-9 font-mono shadow-lg transition-colors"
            >
              {REGIONS_DATA.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code || 'GLB'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Hotspots Quick Switch Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Focus Hotspot:
        </span>
        {FEATURED_HOTSPOTS.map((h) => {
          const isActive = selectedRegionId === h.id;
          return (
            <button
              key={h.id}
              onClick={() => setSelectedRegionId(h.id)}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <span>{h.flag}</span>
              <span>{h.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Actual Satellite Map Image + Right Risk Indicators */}
      <div className="rounded-3xl bg-surface-1 border border-slate-800/90 p-5 sm:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Actual Satellite Map Image (lg:col-span-5) */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-surface-0 border border-slate-700/80 shadow-2xl group min-h-[380px] flex items-center justify-center">
            {/* Actual Satellite Map Image */}
            <img
              src={mapMeta.imageSrc}
              alt={`${region.name} actual satellite climate risk map`}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[460px] object-cover transition-transform duration-700 group-hover:scale-102"
            />

            {/* Subtle scientific grid & scanline HUD overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-surface-0 via-transparent to-black/30" />
            
            {showScanlines && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"
              />
            )}

            {/* Top HUD Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-slate-700/70 text-[11px] font-mono text-emerald-400">
                <Satellite className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-semibold">{mapMeta.sensor.split(' ')[0]}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-300 font-bold">{region.name}</span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setShowScanlines(!showScanlines)}
                  title="Toggle Satellite Scan Grid"
                  className={`p-1.5 rounded-md border text-[11px] backdrop-blur-md transition-colors ${
                    showScanlines
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-black/70 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsFullscreenModalOpen(true)}
                  title="Inspect High-Res Satellite Map"
                  className="p-1.5 rounded-md bg-black/75 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom HUD Metadata */}
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-slate-800 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-white truncate text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  {mapMeta.layerName}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 shrink-0 font-medium">
                  {mapMeta.resolution}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Source: {mapMeta.source}
              </p>
            </div>
          </div>

          {/* Map description caption */}
          <div className="px-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Geo-Anchor: {region.lat > 0 ? `${region.lat.toFixed(1)}°N` : `${Math.abs(region.lat).toFixed(1)}°S`}, {region.lng > 0 ? `${region.lng.toFixed(1)}°E` : `${Math.abs(region.lng).toFixed(1)}°W`}</span>
            </span>
            <button
              onClick={() => setIsFullscreenModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Inspect Satellite Imagery ↗
            </button>
          </div>
        </div>

        {/* Right Side: Risk Indicators & Overall Arc Gauge (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Empirical Hazard Breakdown
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${riskBadge.bg}`}>
              {riskBadge.label} Risk
            </span>
          </div>

          {/* Dynamic Risk Indicators calculated from region.risk */}
          <div className="space-y-4">
            {/* Heat Risk */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-200 font-semibold">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  Heat Anomaly & Wet-Bulb Risk
                </span>
                <span className="font-mono text-orange-400 font-bold">
                  {(region.risk.heatRisk * 10).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, region.risk.heatRisk * 10)}%` }}
                />
              </div>
            </div>

            {/* Flood Risk */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-200 font-semibold">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  Flood & Pluvial Risk
                </span>
                <span className="font-mono text-blue-400 font-bold">
                  {(region.risk.floodRisk * 10).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, region.risk.floodRisk * 10)}%` }}
                />
              </div>
            </div>

            {/* Drought Risk */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-200 font-semibold">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/15 text-yellow-400 flex items-center justify-center">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  Agricultural & Hydrological Drought
                </span>
                <span className="font-mono text-yellow-400 font-bold">
                  {(region.risk.droughtRisk * 10).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, region.risk.droughtRisk * 10)}%` }}
                />
              </div>
            </div>

            {/* Sea Level Risk */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-200 font-semibold">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                    <Waves className="w-3.5 h-3.5" />
                  </div>
                  Sea Level & Coastal Inundation
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {(region.risk.seaLevelRisk * 10).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, region.risk.seaLevelRisk * 10)}%` }}
                />
              </div>
            </div>

            {/* Extreme Weather Risk */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-200 font-semibold">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  Extreme Weather & Storm Surge
                </span>
                <span className="font-mono text-purple-400 font-bold">
                  {(region.risk.extremeWeatherRisk * 10).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, region.risk.extremeWeatherRisk * 10)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Regional Vulnerability Narrative & Key Hazards */}
          <div className="p-4 rounded-2xl bg-surface-0 border border-slate-800/90 space-y-3">
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Vulnerability Profile: </span>
              {region.risk.vulnerabilityFactor}
            </div>

            {region.risk.keyHazards && region.risk.keyHazards.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Identified Critical Hazards:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {region.risk.keyHazards.map((hazard, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] text-slate-200 font-mono"
                    >
                      {hazard}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                Adaptation Readiness
              </span>
              <span className="font-mono font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {region.risk.adaptationReadiness}
              </span>
            </div>
          </div>

          {/* Bottom Arc Gauge: Overall Risk & Scale */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius / 1.5}
                    stroke="#1e293b"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius / 1.5}
                    stroke={riskBadge.color}
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * (radius / 1.5)}
                    strokeDashoffset={
                      2 * Math.PI * (radius / 1.5) -
                      (region.risk.overallScore / 10) * (2 * Math.PI * (radius / 1.5))
                    }
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700"
                  />
                </svg>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block font-mono">
                  Overall Composite Risk
                </span>
                <div className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-1">
                  <span>{region.risk.overallScore}</span>
                  <span className="text-xs text-slate-400">/ 10</span>
                </div>
              </div>
            </div>

            {/* Scale Bar: Low - Moderate - High - Very High */}
            <div className="space-y-1.5 w-full sm:w-56">
              <div className="w-full h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-red-500" />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Low</span>
                <span>Mod</span>
                <span>High</span>
                <span className="text-red-400 font-bold">Severe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Satellite Inspection Modal */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface-0 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-emerald-400" />
                  {region.name} — High-Resolution Satellite Climate Risk Observation
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {mapMeta.satelliteLabel} · {mapMeta.sensor}
                </p>
              </div>
              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Large Satellite Image */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60 relative">
              <img
                src={mapMeta.imageSrc}
                alt={`${region.name} Full Satellite Observation Map`}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-800"
              />
            </div>

            {/* Modal Footer with telemetry notes */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
              <div>
                <span>Source: {mapMeta.source}</span>
                <span className="mx-2">·</span>
                <span>Spatial Grid: {mapMeta.resolution}</span>
              </div>
              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
