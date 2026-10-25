/**
 * ClimateLens Data Types & Interfaces
 */

export type ClimateIndicatorId =
  | 'temperature'
  | 'co2'
  | 'sea_level'
  | 'precipitation'
  | 'arctic_ice'
  | 'forest_cover'
  | 'extreme_heat'
  | 'climate_risk';

export type MapStyleId = 'observatory' | 'thermal' | 'topographic' | 'risk';

export interface IndicatorMeta {
  id: ClimateIndicatorId;
  name: string;
  shortName: string;
  unit: string;
  symbol: string;
  description: string;
  baseline: string;
  color: string;
  accentColor: string;
  minVal: number;
  maxVal: number;
  higherIsWorse: boolean;
  kpiFormat: (val: number) => string;
}

export interface DataPoint {
  year: number;
  value: number;
  anomaly?: number;
  uncertaintyRange?: [number, number];
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface RiskProfile {
  overallScore: number; // 0.0 - 10.0
  heatRisk: number;     // 0.0 - 10.0
  floodRisk: number;    // 0.0 - 10.0
  droughtRisk: number;  // 0.0 - 10.0
  seaLevelRisk: number; // 0.0 - 10.0
  extremeWeatherRisk: number; // 0.0 - 10.0
  vulnerabilityFactor: string;
  adaptationReadiness: string; // e.g. "Moderate", "High", "Critical"
  keyHazards: string[];
}

export interface RegionData {
  id: string;
  name: string;
  type: 'global' | 'continent' | 'country';
  code?: string;
  continent?: string;
  lat: number;
  lng: number;
  risk: RiskProfile;
  indicators: {
    [key in ClimateIndicatorId]?: DataPoint[];
  };
}

export interface ClimateArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  author: string;
  tags: string[];
  content: string[];
  keyTakeaway: string;
  dataMetric: {
    label: string;
    value: string;
    trend: string;
  };
  sources: string[];
}

export interface AiInsightResponse {
  source: string;
  summary: string;
  causes: string[];
  impacts: string[];
  interpretation: string;
  keyTakeaway: string;
  uncertaintyNote: string;
}

export type PageId =
  | 'home'
  | 'map'
  | 'explorer'
  | 'compare'
  | 'risks'
  | 'ai-insights'
  | 'articles'
  | 'about'
  | 'climate-ai'
  | 'globe'
  | 'weather'
  | 'live-map'
  | 'analytics'
  | 'news'
  | 'settings';

export type ChartType = 'line' | 'area' | 'bar';
