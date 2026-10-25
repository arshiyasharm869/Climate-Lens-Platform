import landTopology from 'world-atlas/land-50m.json';
import countriesTopology from 'world-atlas/countries-110m.json';
import { feature } from 'topojson-client';
import { GeoPermissibleObjects } from 'd3-geo';

// Convert TopoJSON to GeoJSON features with high coastline fidelity
export const worldLandFeature = feature(
  landTopology as any,
  landTopology.objects.land as any
) as unknown as GeoPermissibleObjects;

export const worldCountriesFeature = feature(
  countriesTopology as any,
  countriesTopology.objects.countries as any
) as any;

