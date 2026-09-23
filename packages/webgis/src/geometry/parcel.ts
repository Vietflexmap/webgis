import { bbox, distance, midpoint, point } from "@turf/turf";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import type { GeoJSONSource, Map } from "maplibre-gl";
import { formatDistance } from "../measure/MeasureTool";

export interface ParcelHighlightOptions {
  sourceId?: string;
  fillLayerId?: string;
  lineLayerId?: string;
  color?: string;
}

export function createParcelEdgeLabels(
  parcel: Feature<Polygon>
): FeatureCollection<Point> {
  const ring = parcel.geometry.coordinates[0] ?? [];
  const features: Feature<Point>[] = [];

  for (let i = 1; i < ring.length; i += 1) {
    const a = point(ring[i - 1]);
    const b = point(ring[i]);
    const meters = distance(a, b, { units: "kilometers" }) * 1000;
    const mid = midpoint(a, b);
    features.push({
      ...mid,
      properties: {
        kind: "edge-label",
        edgeIndex: i - 1,
        meters,
        text: formatDistance(meters)
      }
    });
  }

  return { type: "FeatureCollection", features };
}

export function fitToGeoJSON(
  map: Map,
  geojson: Feature<Polygon>,
  padding = 40
): void {
  const bounds = bbox(geojson);
  map.fitBounds(
    [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
    { padding }
  );
}

export function highlightParcel(
  map: Map,
  parcel: Feature<Polygon>,
  options: ParcelHighlightOptions = {}
): void {
  const sourceId = options.sourceId ?? "vf-parcel-highlight";
  const fillLayerId = options.fillLayerId ?? sourceId + "-fill";
  const lineLayerId = options.lineLayerId ?? sourceId + "-line";
  const color = options.color ?? "#ff3b30";

  const existing = map.getSource(sourceId);
  if (existing) {
    (existing as GeoJSONSource).setData(parcel);
  } else {
    map.addSource(sourceId, { type: "geojson", data: parcel });
  }

  if (!map.getLayer(fillLayerId)) {
    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      paint: { "fill-color": color, "fill-opacity": 0.16 }
    });
  }

  if (!map.getLayer(lineLayerId)) {
    map.addLayer({
      id: lineLayerId,
      type: "line",
      source: sourceId,
      paint: { "line-color": color, "line-width": 3 }
    });
  }
}
