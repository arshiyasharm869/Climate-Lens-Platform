import { ClimateIndicatorId, IndicatorMeta, RegionData } from '../types/climate';

export const INDICATOR_METAS: Record<ClimateIndicatorId, IndicatorMeta> = {
  temperature: {
    id: 'temperature',
    name: 'Surface Temperature Anomaly',
    shortName: 'Global Temp',
    unit: '°C',
    symbol: 'ΔT',
    description: 'Global mean surface temperature anomaly relative to the 1850–1900 pre-industrial baseline.',
    baseline: '1850–1900 pre-industrial mean',
    color: '#f97316', // warming orange
    accentColor: '#ef4444',
    minVal: -0.5,
    maxVal: 2.0,
    higherIsWorse: true,
    kpiFormat: (v: number) => (v > 0 ? `+${v.toFixed(2)}°C` : `${v.toFixed(2)}°C`),
  },
  co2: {
    id: 'co2',
    name: 'Atmospheric CO₂ Concentration',
    shortName: 'CO₂ Level',
    unit: 'ppm',
    symbol: 'CO₂',
    description: 'Globally averaged atmospheric carbon dioxide dry air mole fraction measured in parts per million.',
    baseline: 'Pre-industrial ~280 ppm',
    color: '#06b6d4', // cyan
    accentColor: '#38bdf8',
    minVal: 270,
    maxVal: 450,
    higherIsWorse: true,
    kpiFormat: (v: number) => `${Math.round(v)} ppm`,
  },
  sea_level: {
    id: 'sea_level',
    name: 'Global Mean Sea Level Rise',
    shortName: 'Sea Level',
    unit: 'mm',
    symbol: 'GMSL',
    description: 'Change in global mean sea level derived from satellite radar altimetry and tide gauges since 1993.',
    baseline: '1993 satellite baseline (0 mm)',
    color: '#3b82f6', // blue
    accentColor: '#60a5fa',
    minVal: -15,
    maxVal: 120,
    higherIsWorse: true,
    kpiFormat: (v: number) => (v > 0 ? `+${Math.round(v)} mm` : `${Math.round(v)} mm`),
  },
  arctic_ice: {
    id: 'arctic_ice',
    name: 'Arctic Summer Sea Ice Extent',
    shortName: 'Arctic Ice',
    unit: '%',
    symbol: 'Ice Min',
    description: 'Decline in minimum September Arctic sea ice extent relative to the 1979–2000 satellite median.',
    baseline: '1979–2000 median extent (6.7M km²)',
    color: '#10b981', // emerald
    accentColor: '#34d399',
    minVal: -40,
    maxVal: 5,
    higherIsWorse: false, // more negative is worse
    kpiFormat: (v: number) => `${v.toFixed(1)}%`,
  },
  precipitation: {
    id: 'precipitation',
    name: 'Precipitation Anomaly',
    shortName: 'Precipitation',
    unit: '%',
    symbol: 'Precip',
    description: 'Global terrestrial precipitation deviation relative to the 1961–1990 climatological standard normal.',
    baseline: '1961–1990 global average',
    color: '#0284c7',
    accentColor: '#0ea5e9',
    minVal: -8,
    maxVal: 8,
    higherIsWorse: true,
    kpiFormat: (v: number) => (v > 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`),
  },
  forest_cover: {
    id: 'forest_cover',
    name: 'Primary Forest Cover Index',
    shortName: 'Forest Cover',
    unit: '%',
    symbol: 'Tree Canopy',
    description: 'Global primary forest canopy retention percentage indexed against 1990 global forested land baseline.',
    baseline: '1990 baseline (100%)',
    color: '#059669',
    accentColor: '#10b981',
    minVal: 85,
    maxVal: 105,
    higherIsWorse: false,
    kpiFormat: (v: number) => `${v.toFixed(1)}%`,
  },
  extreme_heat: {
    id: 'extreme_heat',
    name: 'Extreme Heat Days Anomaly',
    shortName: 'Extreme Heat',
    unit: 'days/yr',
    symbol: 'T > 35°C',
    description: 'Additional annual days with maximum surface temperature exceeding 35°C (95°F) over baseline.',
    baseline: '1961–1990 climatology',
    color: '#ea580c',
    accentColor: '#f97316',
    minVal: 0,
    maxVal: 35,
    higherIsWorse: true,
    kpiFormat: (v: number) => `+${v.toFixed(1)} d/yr`,
  },
  climate_risk: {
    id: 'climate_risk',
    name: 'Composite Climate Vulnerability Index',
    shortName: 'Risk Index',
    unit: '/10',
    symbol: 'Risk',
    description: 'Composite multi-hazard vulnerability and exposure index combining heat, flood, drought, and storm pressures.',
    baseline: 'Normative index scale (0 = Minimum, 10 = Severe)',
    color: '#dc2626',
    accentColor: '#ef4444',
    minVal: 0,
    maxVal: 10,
    higherIsWorse: true,
    kpiFormat: (v: number) => `${v.toFixed(1)} / 10`,
  },
};

// Continuous series generator function to create realistic smooth historical curves (1880 to 2026)
function generateYearlySeries(
  keyPoints: { year: number; val: number }[],
  noiseAmp: number = 0.02
): { year: number; value: number }[] {
  const result: { year: number; value: number }[] = [];
  keyPoints.sort((a, b) => a.year - b.year);

  for (let y = 1880; y <= 2026; y++) {
    // Find enclosing segment
    let left = keyPoints[0];
    let right = keyPoints[keyPoints.length - 1];

    for (let i = 0; i < keyPoints.length - 1; i++) {
      if (keyPoints[i].year <= y && keyPoints[i + 1].year >= y) {
        left = keyPoints[i];
        right = keyPoints[i + 1];
        break;
      }
    }

    const span = right.year - left.year;
    const t = span === 0 ? 0 : (y - left.year) / span;
    // Hermite or smooth interpolation
    const smoothT = t * t * (3 - 2 * t);
    const baseVal = left.val + (right.val - left.val) * smoothT;
    
    // Controlled pseudo-deterministic harmonic noise based on year to look authentic without jittering on re-render
    const noise = Math.sin(y * 1.7) * noiseAmp * 0.5 + Math.cos(y * 0.9) * noiseAmp * 0.5;
    const finalVal = Math.round((baseVal + noise) * 100) / 100;
    result.push({ year: y, value: finalVal });
  }

  return result;
}

// Global reference time series
const globalTempPoints = [
  { year: 1880, val: -0.16 },
  { year: 1900, val: -0.10 },
  { year: 1920, val: -0.22 },
  { year: 1940, val: +0.08 },
  { year: 1960, val: +0.01 },
  { year: 1980, val: +0.26 },
  { year: 1990, val: +0.44 },
  { year: 2000, val: +0.61 },
  { year: 2010, val: +0.82 },
  { year: 2015, val: +0.98 },
  { year: 2020, val: +1.09 },
  { year: 2024, val: +1.20 },
  { year: 2026, val: +1.24 },
];

const globalCo2Points = [
  { year: 1880, val: 290.8 },
  { year: 1900, val: 295.7 },
  { year: 1920, val: 303.4 },
  { year: 1940, val: 311.2 },
  { year: 1960, val: 316.9 },
  { year: 1980, val: 338.7 },
  { year: 1990, val: 354.4 },
  { year: 2000, val: 369.5 },
  { year: 2010, val: 389.9 },
  { year: 2015, val: 401.0 },
  { year: 2020, val: 414.2 },
  { year: 2024, val: 421.1 },
  { year: 2026, val: 423.0 },
];

const globalSeaLevelPoints = [
  { year: 1880, val: -160.0 },
  { year: 1900, val: -130.0 },
  { year: 1930, val: -95.0 },
  { year: 1960, val: -55.0 },
  { year: 1980, val: -22.0 },
  { year: 1993, val: 0.0 }, // satellite start
  { year: 2000, val: +21.4 },
  { year: 2010, val: +52.1 },
  { year: 2020, val: +88.2 },
  { year: 2024, val: +98.0 },
  { year: 2026, val: +102.0 },
];

const globalArcticIcePoints = [
  { year: 1880, val: 4.2 },
  { year: 1900, val: 3.8 },
  { year: 1940, val: 2.9 },
  { year: 1970, val: 1.5 },
  { year: 1979, val: 0.0 },
  { year: 1990, val: -4.2 },
  { year: 2000, val: -7.6 },
  { year: 2010, val: -10.5 },
  { year: 2015, val: -11.9 },
  { year: 2020, val: -12.6 },
  { year: 2026, val: -13.1 },
];

const globalPrecipPoints = [
  { year: 1880, val: -0.4 },
  { year: 1920, val: -0.1 },
  { year: 1950, val: +0.2 },
  { year: 1980, val: +0.8 },
  { year: 2000, val: +1.5 },
  { year: 2010, val: +2.1 },
  { year: 2020, val: +2.6 },
  { year: 2026, val: +2.8 },
];

const globalForestPoints = [
  { year: 1880, val: 114.0 },
  { year: 1920, val: 108.5 },
  { year: 1950, val: 104.2 },
  { year: 1990, val: 100.0 },
  { year: 2000, val: 97.4 },
  { year: 2010, val: 94.6 },
  { year: 2020, val: 92.1 },
  { year: 2026, val: 90.8 },
];

const globalHeatPoints = [
  { year: 1880, val: 3.1 },
  { year: 1920, val: 3.4 },
  { year: 1960, val: 4.1 },
  { year: 1980, val: 5.6 },
  { year: 2000, val: 8.4 },
  { year: 2010, val: 11.2 },
  { year: 2020, val: 13.8 },
  { year: 2026, val: 14.6 },
];

const globalRiskPoints = [
  { year: 1880, val: 1.8 },
  { year: 1920, val: 2.1 },
  { year: 1960, val: 2.9 },
  { year: 1980, val: 3.8 },
  { year: 2000, val: 4.9 },
  { year: 2010, val: 5.8 },
  { year: 2020, val: 6.7 },
  { year: 2026, val: 7.2 },
];

export const REGIONS_DATA: RegionData[] = [
  {
    id: 'global',
    name: 'Global Average',
    type: 'global',
    code: 'WLD',
    lat: 20,
    lng: 0,
    risk: {
      overallScore: 6.8,
      heatRisk: 7.2,
      floodRisk: 6.9,
      droughtRisk: 6.5,
      seaLevelRisk: 7.0,
      extremeWeatherRisk: 7.3,
      vulnerabilityFactor: 'Accelerating cross-system planetary tipping cascading risks.',
      adaptationReadiness: 'Moderate',
      keyHazards: ['Compound marine heatwaves', 'Cryosphere loss', 'Coastal surge'],
    },
    indicators: {
      temperature: generateYearlySeries(globalTempPoints, 0.04),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(globalSeaLevelPoints, 0.8),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(globalPrecipPoints, 0.3),
      forest_cover: generateYearlySeries(globalForestPoints, 0.2),
      extreme_heat: generateYearlySeries(globalHeatPoints, 0.3),
      climate_risk: generateYearlySeries(globalRiskPoints, 0.1),
    },
  },
  {
    id: 'in',
    name: 'India',
    type: 'country',
    code: 'IND',
    continent: 'Asia',
    lat: 20.5937,
    lng: 78.9629,
    risk: {
      overallScore: 7.8,
      heatRisk: 9.1,
      floodRisk: 8.4,
      droughtRisk: 7.9,
      seaLevelRisk: 6.8,
      extremeWeatherRisk: 8.6,
      vulnerabilityFactor: 'High agricultural sensitivity to monsoon variability and extreme wet-bulb temperatures.',
      adaptationReadiness: 'Moderate',
      keyHazards: ['Deadly wet-bulb heatwaves', 'Monsoon flash flooding', 'Glacial lake outbursts'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.18 + (p.year > 1980 ? 0.14 : 0) })),
        0.06
      ),
      co2: generateYearlySeries(
        globalCo2Points.map(p => ({ year: p.year, val: p.val + (p.year > 2000 ? (p.year - 2000) * 0.3 : 0) })),
        0.2
      ),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.1 })),
        0.9
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: p.val * 2.2 - 1.2 })),
        0.8
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 120 },
          { year: 1980, val: 96 },
          { year: 2000, val: 94 },
          { year: 2010, val: 95.5 },
          { year: 2026, val: 96.8 }, // Afforestation programs
        ],
        0.3
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.85 })),
        0.5
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: Math.min(10, p.val * 1.15) })),
        0.15
      ),
    },
  },
  {
    id: 'us',
    name: 'United States',
    type: 'country',
    code: 'USA',
    continent: 'North America',
    lat: 37.0902,
    lng: -95.7129,
    risk: {
      overallScore: 6.4,
      heatRisk: 6.8,
      floodRisk: 6.5,
      droughtRisk: 7.4,
      seaLevelRisk: 6.9,
      extremeWeatherRisk: 8.2,
      vulnerabilityFactor: 'High economic infrastructure exposure to catastrophic tropical cyclones, wildfires, and atmospheric rivers.',
      adaptationReadiness: 'High',
      keyHazards: ['Category 4-5 hurricanes', 'Southwestern megadrought', 'Wildfire smoke crises'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.22 + (p.year > 1970 ? 0.12 : 0) })),
        0.08
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.25 })), // Gulf coast subsidence
        1.1
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: p.val * 1.4 })),
        0.6
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 108 },
          { year: 1950, val: 98 },
          { year: 2000, val: 99.2 },
          { year: 2026, val: 98.4 },
        ],
        0.3
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.4 })),
        0.4
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 0.92 })),
        0.1
      ),
    },
  },
  {
    id: 'cn',
    name: 'China',
    type: 'country',
    code: 'CHN',
    continent: 'Asia',
    lat: 35.8617,
    lng: 104.1954,
    risk: {
      overallScore: 7.2,
      heatRisk: 7.8,
      floodRisk: 8.2,
      droughtRisk: 7.3,
      seaLevelRisk: 7.7,
      extremeWeatherRisk: 7.9,
      vulnerabilityFactor: 'Dense coastal megalopolises vulnerable to typhoons, combined with intense Yangtze/Yellow River basin flood variability.',
      adaptationReadiness: 'High',
      keyHazards: ['Mega-basin riverine flooding', 'Typhoon storm surges', 'Northern desertification'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.28 + (p.year > 1990 ? 0.15 : 0) })),
        0.07
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.15 })),
        1.0
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: p.val * 1.3 })),
        0.5
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 115 },
          { year: 1970, val: 86 },
          { year: 2000, val: 93 },
          { year: 2015, val: 102 },
          { year: 2026, val: 106.4 }, // Great Green Wall
        ],
        0.3
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.55 })),
        0.4
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 1.05 })),
        0.1
      ),
    },
  },
  {
    id: 'de',
    name: 'Germany',
    type: 'country',
    code: 'DEU',
    continent: 'Europe',
    lat: 51.1657,
    lng: 10.4515,
    risk: {
      overallScore: 5.2,
      heatRisk: 6.1,
      floodRisk: 6.9,
      droughtRisk: 5.8,
      seaLevelRisk: 4.5,
      extremeWeatherRisk: 6.3,
      vulnerabilityFactor: 'River navigation disruption from summer drought and intense flash flooding in mountainous valleys.',
      adaptationReadiness: 'Very High',
      keyHazards: ['Rhine low-water events', 'Ahr-valley flash floods', 'Forest dieback (Waldsterben)'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.45 + (p.year > 1980 ? 0.22 : 0) })),
        0.08
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 0.95 })),
        0.8
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: p.val * 1.1 })),
        0.6
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 96 },
          { year: 1960, val: 98 },
          { year: 2000, val: 100 },
          { year: 2026, val: 99.1 },
        ],
        0.2
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.1 })),
        0.3
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 0.76 })),
        0.08
      ),
    },
  },
  {
    id: 'br',
    name: 'Brazil',
    type: 'country',
    code: 'BRA',
    continent: 'South America',
    lat: -14.235,
    lng: -51.9253,
    risk: {
      overallScore: 7.5,
      heatRisk: 8.3,
      floodRisk: 7.6,
      droughtRisk: 8.7,
      seaLevelRisk: 5.8,
      extremeWeatherRisk: 7.7,
      vulnerabilityFactor: 'Amazon biome tipping point transition risk, threatening South American hydrological cycles and hydroelectricity.',
      adaptationReadiness: 'Moderate',
      keyHazards: ['Amazon basin drought & wildfires', 'Cerrado agricultural heat stress', 'Pantanal wetland fires'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.15 + (p.year > 1990 ? 0.18 : 0) })),
        0.05
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.0 })),
        0.8
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: -1.2 * p.val })), // Dry bias
        0.7
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 135 },
          { year: 1970, val: 120 },
          { year: 1990, val: 100 },
          { year: 2010, val: 88.5 },
          { year: 2026, val: 82.2 }, // Deforestation pressures
        ],
        0.3
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.6 })),
        0.4
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 1.1 })),
        0.1
      ),
    },
  },
  {
    id: 'au',
    name: 'Australia',
    type: 'country',
    code: 'AUS',
    continent: 'Oceania',
    lat: -25.2744,
    lng: 133.7751,
    risk: {
      overallScore: 7.1,
      heatRisk: 8.9,
      floodRisk: 6.8,
      droughtRisk: 8.6,
      seaLevelRisk: 6.4,
      extremeWeatherRisk: 8.5,
      vulnerabilityFactor: 'Extreme fire weather seasons, Great Barrier Reef thermal bleaching, and compound agricultural droughts.',
      adaptationReadiness: 'High',
      keyHazards: ['Black Summer megafires', 'Mass coral bleaching', 'Murray-Darling water depletion'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.32 + (p.year > 1980 ? 0.2 : 0) })),
        0.09
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.1 })),
        0.9
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: -0.8 * p.val })),
        0.9
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 110 },
          { year: 1990, val: 100 },
          { year: 2010, val: 96.2 },
          { year: 2026, val: 93.8 },
        ],
        0.3
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.9 })),
        0.5
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 1.04 })),
        0.1
      ),
    },
  },
  {
    id: 'eg',
    name: 'Egypt',
    type: 'country',
    code: 'EGY',
    continent: 'Africa',
    lat: 26.8206,
    lng: 30.8025,
    risk: {
      overallScore: 8.1,
      heatRisk: 9.3,
      floodRisk: 5.2,
      droughtRisk: 9.2,
      seaLevelRisk: 8.9,
      extremeWeatherRisk: 7.8,
      vulnerabilityFactor: 'Nile Delta soil salinization and inundation combined with extreme Saharan heat and severe per-capita water stress.',
      adaptationReadiness: 'Moderate',
      keyHazards: ['Nile Delta coastal intrusion', 'Extreme hyper-arid heatwaves', 'Wheat yield depression'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.4 + 0.15 })),
        0.08
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.2 })), // Delta subsidence
        1.0
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: -1.5 * p.val })),
        0.4
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 100 },
          { year: 2026, val: 100 },
        ],
        0.05
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 2.1 })),
        0.5
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: Math.min(10, p.val * 1.2) })),
        0.12
      ),
    },
  },
  {
    id: 'jp',
    name: 'Japan',
    type: 'country',
    code: 'JPN',
    continent: 'Asia',
    lat: 36.2048,
    lng: 138.2529,
    risk: {
      overallScore: 6.7,
      heatRisk: 7.0,
      floodRisk: 8.3,
      droughtRisk: 4.8,
      seaLevelRisk: 7.2,
      extremeWeatherRisk: 8.4,
      vulnerabilityFactor: 'Extreme mountainous terrain prone to torrential typhoon landslides and dense low-lying coastal urban zones.',
      adaptationReadiness: 'Very High',
      keyHazards: ['Super typhoon inundation', 'Urban heat island spikes', 'Mountainous debris flows'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.25 + 0.1 })),
        0.07
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.05 })),
        0.9
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: p.val * 1.8 })),
        0.6
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 100 },
          { year: 2000, val: 100.2 },
          { year: 2026, val: 100.1 },
        ],
        0.1
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.25 })),
        0.3
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 0.98 })),
        0.1
      ),
    },
  },
  {
    id: 'ca',
    name: 'Canada',
    type: 'country',
    code: 'CAN',
    continent: 'North America',
    lat: 56.1304,
    lng: -106.3468,
    risk: {
      overallScore: 5.9,
      heatRisk: 6.2,
      floodRisk: 6.4,
      droughtRisk: 6.6,
      seaLevelRisk: 4.8,
      extremeWeatherRisk: 7.8,
      vulnerabilityFactor: 'Boreal permafrost thaw destabilization, rapid Arctic amplification warming at more than twice the global rate.',
      adaptationReadiness: 'Very High',
      keyHazards: ['Mega boreal wildfires', 'Permafrost infrastructure thaw', 'Pacific Northwest heat domes'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 2.1 })), // Arctic amplification
        0.12
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 0.8 })), // Post-glacial rebound
        0.7
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: p.val * 1.7 })),
        0.5
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 103 },
          { year: 1990, val: 100 },
          { year: 2026, val: 97.2 },
        ],
        0.2
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.15 })),
        0.3
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 0.87 })),
        0.08
      ),
    },
  },
  {
    id: 'za',
    name: 'South Africa',
    type: 'country',
    code: 'ZAF',
    continent: 'Africa',
    lat: -30.5595,
    lng: 22.9375,
    risk: {
      overallScore: 7.4,
      heatRisk: 8.1,
      floodRisk: 6.8,
      droughtRisk: 8.8,
      seaLevelRisk: 6.0,
      extremeWeatherRisk: 7.9,
      vulnerabilityFactor: 'Urban water security crises (Day Zero risk) and agricultural vulnerability across arid Karoo and Mediterranean zones.',
      adaptationReadiness: 'Moderate',
      keyHazards: ['Day Zero urban droughts', 'KwaZulu-Natal flash floods', 'Crop yield contraction'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.28 + 0.1 })),
        0.07
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.05 })),
        0.8
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: -1.4 * p.val })),
        0.8
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 105 },
          { year: 1990, val: 100 },
          { year: 2026, val: 96.5 },
        ],
        0.2
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.6 })),
        0.4
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 1.09 })),
        0.1
      ),
    },
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    type: 'country',
    code: 'GBR',
    continent: 'Europe',
    lat: 55.3781,
    lng: -3.436,
    risk: {
      overallScore: 5.4,
      heatRisk: 5.8,
      floodRisk: 7.2,
      droughtRisk: 5.4,
      seaLevelRisk: 6.5,
      extremeWeatherRisk: 6.7,
      vulnerabilityFactor: 'Coastal erosion on soft eastern cliffs and riverine winter flooding from severe North Atlantic jet stream storms.',
      adaptationReadiness: 'Very High',
      keyHazards: ['40°C+ summer temperature anomalies', 'Winter storm cluster floods', 'Eastern coast erosion'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.2 + 0.05 })),
        0.08
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.0 })),
        0.8
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: p.val * 1.3 })),
        0.6
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 78 },
          { year: 1950, val: 85 },
          { year: 1990, val: 100 },
          { year: 2026, val: 105.8 },
        ],
        0.2
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 0.9 })),
        0.3
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: p.val * 0.79 })),
        0.08
      ),
    },
  },
  {
    id: 'id',
    name: 'Indonesia',
    type: 'country',
    code: 'IDN',
    continent: 'Asia',
    lat: -0.7893,
    lng: 113.9213,
    risk: {
      overallScore: 8.0,
      heatRisk: 7.8,
      floodRisk: 9.1,
      droughtRisk: 6.8,
      seaLevelRisk: 9.3,
      extremeWeatherRisk: 8.4,
      vulnerabilityFactor: 'Archipelagic exposure to rising seas, subsidence in coastal cities (Jakarta relocation), and peatland wildfire smoke.',
      adaptationReadiness: 'Moderate',
      keyHazards: ['North Jakarta inundation', 'Peatland forest megafires', 'Tropical marine heatwaves'],
    },
    indicators: {
      temperature: generateYearlySeries(
        globalTempPoints.map(p => ({ year: p.year, val: p.val * 1.05 + 0.08 })),
        0.05
      ),
      co2: generateYearlySeries(globalCo2Points, 0.2),
      sea_level: generateYearlySeries(
        globalSeaLevelPoints.map(p => ({ year: p.year, val: p.val * 1.35 })),
        1.1
      ),
      arctic_ice: generateYearlySeries(globalArcticIcePoints, 0.3),
      precipitation: generateYearlySeries(
        globalPrecipPoints.map(p => ({ year: p.year, val: p.val * 1.5 })),
        0.7
      ),
      forest_cover: generateYearlySeries(
        [
          { year: 1880, val: 140 },
          { year: 1990, val: 100 },
          { year: 2010, val: 86 },
          { year: 2026, val: 78.5 },
        ],
        0.3
      ),
      extreme_heat: generateYearlySeries(
        globalHeatPoints.map(p => ({ year: p.year, val: p.val * 1.3 })),
        0.3
      ),
      climate_risk: generateYearlySeries(
        globalRiskPoints.map(p => ({ year: p.year, val: Math.min(10, p.val * 1.18) })),
        0.1
      ),
    },
  },
];

// Helper to find region by id
export function getRegionById(id: string): RegionData {
  const found = REGIONS_DATA.find(r => r.id === id);
  return found || REGIONS_DATA[0];
}

// Key KPI highlights for 2026
export const CLIMATE_KPI_HIGHLIGHTS = [
  {
    indicator: 'temperature' as ClimateIndicatorId,
    label: 'Global Temperature Anomaly',
    value: '+1.24°C',
    numericVal: 1.24,
    changeText: '+0.42°C since 2000',
    trend: 'up',
    color: '#f97316',
    reference: 'Relative to 1850–1900 pre-industrial',
    datasetNote: 'Demonstration dataset based on NASA GISTEMP v4 baseline',
  },
  {
    indicator: 'co2' as ClimateIndicatorId,
    label: 'Atmospheric CO₂ Concentration',
    value: '423 ppm',
    numericVal: 423,
    changeText: '+53.5 ppm since 2000',
    trend: 'up',
    color: '#06b6d4',
    reference: 'Mauna Loa Observatory standard',
    datasetNote: 'Demonstration dataset based on NOAA Global Monitoring Lab',
  },
  {
    indicator: 'sea_level' as ClimateIndicatorId,
    label: 'Global Mean Sea Level Rise',
    value: '+102 mm',
    numericVal: 102,
    changeText: 'Rate: +3.8 mm / year',
    trend: 'up',
    color: '#3b82f6',
    reference: 'Cumulative rise since 1993',
    datasetNote: 'Demonstration dataset based on Satellite Altimetry GMSL',
  },
  {
    indicator: 'arctic_ice' as ClimateIndicatorId,
    label: 'Arctic Summer Sea Ice Extent',
    value: '-13.1%',
    numericVal: -13.1,
    changeText: 'Decline per decade vs 1979–2000',
    trend: 'down',
    color: '#10b981',
    reference: 'September minimum extent anomaly',
    datasetNote: 'Demonstration dataset based on NSIDC Sea Ice Index',
  },
];
