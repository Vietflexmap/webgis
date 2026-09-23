import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import type { GeoJSONSource, Map } from "maplibre-gl";

export interface VectorSourceOptions {
  tiles: string[];
  minzoom?: number;
  maxzoom?: number;
  promoteId?: string;
}

export function ensureVectorSource(map: Map, id: string, options: VectorSourceOptions): void {
  if (map.getSource(id)) return;
  map.addSource(id, {
    type: "vector",
    tiles: options.tiles,
    minzoom: options.minzoom,
    maxzoom: options.maxzoom,
    promoteId: options.promoteId
  });
}

export function ensureGeoJSONSource(
  map: Map,
  id: string,
  data: FeatureCollection<Geometry, GeoJsonProperties>
): GeoJSONSource {
  const existing = map.getSource(id);
  if (existing) {
    const source = existing as GeoJSONSource;
    source.setData(data);
    return source;
  }
  map.addSource(id, { type: "geojson", data });
  return map.getSource(id) as GeoJSONSource;
}
