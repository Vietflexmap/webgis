import type { MapGeoJSONFeature } from "maplibre-gl";

export type MeasureMode = "distance" | "area";

export interface FeatureEndpointConfig {
  attributes?: string;
  documents?: string;
  images?: string;
}

export interface DisplayField {
  label: string;
  property: string;
  suffix?: string;
}

export interface WebGISLayerDefinition {
  key: string;
  queryLayerId: string;
  selectedLayerId?: string;
  idProperty?: string;
  requestParam?: string;
  enabled?: boolean;
  endpoints?: FeatureEndpointConfig;
  fields?: DisplayField[];
  metadata?: Record<string, unknown>;
}

export interface PickedFeature {
  definition: WebGISLayerDefinition;
  feature: MapGeoJSONFeature;
  id: string | number | null;
}

export interface LoadedFeatureData {
  attributes?: unknown;
  documents?: unknown;
  images?: unknown;
  errors: Record<string, string>;
}

export interface MeasureResult {
  mode: MeasureMode;
  value: number;
  formatted: string;
  coordinates: [number, number][];
}
