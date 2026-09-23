import {
  area as turfArea,
  centerOfMass,
  distance as turfDistance,
  midpoint,
  point,
  polygon
} from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  LineString,
  Point,
  Polygon
} from "geojson";
import type { GeoJSONSource, Map, MapMouseEvent } from "maplibre-gl";
import type { MeasureMode, MeasureResult } from "../types";

export interface MeasureToolOptions {
  prefix?: string;
  onChange?: (result: MeasureResult | null) => void;
  onFinish?: (result: MeasureResult) => void;
}

export function formatDistance(meters: number): string {
  return meters >= 1000
    ? (meters / 1000).toFixed(2) + " km"
    : meters.toFixed(2) + " m";
}

export function formatArea(squareMeters: number): string {
  if (squareMeters >= 1000000) return (squareMeters / 1000000).toFixed(2) + " km²";
  if (squareMeters >= 10000) return (squareMeters / 10000).toFixed(2) + " ha";
  return squareMeters.toFixed(2) + " m²";
}

export class MeasureTool {
  private readonly map: Map;
  private readonly prefix: string;
  private readonly onChange?: (result: MeasureResult | null) => void;
  private readonly onFinish?: (result: MeasureResult) => void;
  private points: [number, number][] = [];
  private hoverPoint: [number, number] | null = null;
  private mode: MeasureMode | null = null;
  private active = false;

  private readonly onClick = (event: MapMouseEvent) => {
    if (!this.active) return;
    this.points.push([event.lngLat.lng, event.lngLat.lat]);
    this.hoverPoint = null;
    this.render();
  };

  private readonly onMouseMove = (event: MapMouseEvent) => {
    if (!this.active || !this.points.length) return;
    this.hoverPoint = [event.lngLat.lng, event.lngLat.lat];
    this.render();
  };

  private readonly onDoubleClick = (event: MapMouseEvent) => {
    if (!this.active) return;
    event.preventDefault();
    this.finish();
  };

  constructor(map: Map, options: MeasureToolOptions = {}) {
    this.map = map;
    this.prefix = options.prefix ?? "vf-measure";
    this.onChange = options.onChange;
    this.onFinish = options.onFinish;
  }

  start(mode: MeasureMode): void {
    this.stopListeners();
    this.mode = mode;
    this.points = [];
    this.hoverPoint = null;
    this.active = true;
    this.ensureLayers();
    this.map.doubleClickZoom.disable();
    this.map.on("click", this.onClick);
    this.map.on("mousemove", this.onMouseMove);
    this.map.on("dblclick", this.onDoubleClick);
    this.render();
  }

  finish(): MeasureResult | null {
    if (!this.mode) return null;
    const minimum = this.mode === "area" ? 3 : 2;
    if (this.points.length < minimum) return null;

    this.active = false;
    this.hoverPoint = null;
    this.stopListeners();
    this.map.doubleClickZoom.enable();
    this.render();

    const result = this.getResult();
    if (result) this.onFinish?.(result);
    return result;
  }

  cancel(): void {
    this.active = false;
    this.mode = null;
    this.points = [];
    this.hoverPoint = null;
    this.stopListeners();
    this.map.doubleClickZoom.enable();
    this.render();
    this.onChange?.(null);
  }

  clear(): void {
    this.points = [];
    this.hoverPoint = null;
    this.render();
    this.onChange?.(null);
  }

  getResult(): MeasureResult | null {
    if (!this.mode) return null;
    const minimum = this.mode === "area" ? 3 : 2;
    if (this.points.length < minimum) return null;

    if (this.mode === "distance") {
      let kilometers = 0;
      for (let i = 1; i < this.points.length; i += 1) {
        kilometers += turfDistance(point(this.points[i - 1]), point(this.points[i]), {
          units: "kilometers"
        });
      }
      const meters = kilometers * 1000;
      return {
        mode: this.mode,
        value: meters,
        formatted: formatDistance(meters),
        coordinates: [...this.points]
      };
    }

    const ring = closeRing(this.points);
    const squareMeters = turfArea(polygon([ring]));
    return {
      mode: this.mode,
      value: squareMeters,
      formatted: formatArea(squareMeters),
      coordinates: [...this.points]
    };
  }

  destroy(): void {
    this.cancel();
    for (const id of [
      this.prefix + "-labels",
      this.prefix + "-points",
      this.prefix + "-line",
      this.prefix + "-fill"
    ]) {
      if (this.map.getLayer(id)) this.map.removeLayer(id);
    }
    if (this.map.getSource(this.prefix)) this.map.removeSource(this.prefix);
  }

  private stopListeners(): void {
    this.map.off("click", this.onClick);
    this.map.off("mousemove", this.onMouseMove);
    this.map.off("dblclick", this.onDoubleClick);
  }

  private ensureLayers(): void {
    if (!this.map.getSource(this.prefix)) {
      this.map.addSource(this.prefix, { type: "geojson", data: emptyCollection() });
    }

    if (!this.map.getLayer(this.prefix + "-fill")) {
      this.map.addLayer({
        id: this.prefix + "-fill",
        type: "fill",
        source: this.prefix,
        filter: ["==", ["get", "kind"], "area"],
        paint: { "fill-color": "#696cff", "fill-opacity": 0.16 }
      });
    }

    if (!this.map.getLayer(this.prefix + "-line")) {
      this.map.addLayer({
        id: this.prefix + "-line",
        type: "line",
        source: this.prefix,
        filter: ["==", ["get", "kind"], "line"],
        paint: { "line-color": "#696cff", "line-width": 2.5 }
      });
    }

    if (!this.map.getLayer(this.prefix + "-points")) {
      this.map.addLayer({
        id: this.prefix + "-points",
        type: "circle",
        source: this.prefix,
        filter: ["==", ["get", "kind"], "vertex"],
        paint: {
          "circle-radius": 5,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#696cff",
          "circle-stroke-width": 2
        }
      });
    }

    if (!this.map.getLayer(this.prefix + "-labels")) {
      this.map.addLayer({
        id: this.prefix + "-labels",
        type: "symbol",
        source: this.prefix,
        filter: ["==", ["get", "kind"], "label"],
        layout: {
          "text-field": ["get", "text"],
          "text-size": 12,
          "text-allow-overlap": true
        },
        paint: {
          "text-color": "#111827",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2
        }
      });
    }
  }

  private render(): void {
    if (!this.map.getSource(this.prefix)) return;

    const coordinates = this.hoverPoint && this.active
      ? [...this.points, this.hoverPoint]
      : [...this.points];

    const features: Feature<Geometry, GeoJsonProperties>[] = coordinates.map(
      (coordinate, index) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: coordinate },
        properties: { kind: "vertex", index }
      })
    );

    if (this.mode === "distance" && coordinates.length >= 2) {
      const line: Feature<LineString> = {
        type: "Feature",
        geometry: { type: "LineString", coordinates },
        properties: { kind: "line" }
      };
      features.push(line);

      for (let i = 1; i < coordinates.length; i += 1) {
        const a = point(coordinates[i - 1]);
        const b = point(coordinates[i]);
        const meters = turfDistance(a, b, { units: "kilometers" }) * 1000;
        const mid = midpoint(a, b);
        features.push(labelFeature(mid.geometry.coordinates, formatDistance(meters)));
      }
    }

    if (this.mode === "area" && coordinates.length >= 3) {
      const ring = closeRing(coordinates);
      const poly: Feature<Polygon> = {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [ring] },
        properties: { kind: "area" }
      };
      features.push(poly);
      features.push({
        type: "Feature",
        geometry: { type: "LineString", coordinates: ring },
        properties: { kind: "line" }
      });

      const squareMeters = turfArea(poly);
      const center = centerOfMass(poly);
      features.push(labelFeature(center.geometry.coordinates, formatArea(squareMeters)));
    }

    (this.map.getSource(this.prefix) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features
    });

    this.onChange?.(this.getResult());
  }
}

function closeRing(points: [number, number][]): [number, number][] {
  const ring = [...points];
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (!first || !last) return ring;
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);
  return ring;
}

function labelFeature(
  coordinates: number[],
  text: string
): Feature<Point, GeoJsonProperties> {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: { kind: "label", text }
  };
}

function emptyCollection(): FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}
