import type {
  ExpressionSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  Map,
  SymbolLayerSpecification
} from "maplibre-gl";

interface BaseLayerOptions {
  id: string;
  source: string;
  sourceLayer?: string;
  minzoom?: number;
  maxzoom?: number;
}

export interface FillLayerOptions extends BaseLayerOptions {
  color?: string | ExpressionSpecification;
  opacity?: number | ExpressionSpecification;
  outlineColor?: string | ExpressionSpecification;
}

export interface LineLayerOptions extends BaseLayerOptions {
  color?: string | ExpressionSpecification;
  width?: number | ExpressionSpecification;
  opacity?: number | ExpressionSpecification;
}

export interface SymbolLayerOptions extends BaseLayerOptions {
  iconImage?: string | ExpressionSpecification;
  iconSize?: number | ExpressionSpecification;
  textField?: string | ExpressionSpecification;
  textSize?: number | ExpressionSpecification;
  textColor?: string | ExpressionSpecification;
}

export interface LabelLayerOptions extends BaseLayerOptions {
  textField: string | ExpressionSpecification;
  textSize?: number | ExpressionSpecification;
  textColor?: string | ExpressionSpecification;
  haloColor?: string | ExpressionSpecification;
  haloWidth?: number | ExpressionSpecification;
}

export function addFillLayer(map: Map, options: FillLayerOptions): void {
  if (map.getLayer(options.id)) return;
  const layer: FillLayerSpecification = {
    id: options.id,
    type: "fill",
    source: options.source,
    "source-layer": options.sourceLayer,
    minzoom: options.minzoom,
    maxzoom: options.maxzoom,
    paint: {
      "fill-color": options.color ?? "#696cff",
      "fill-opacity": options.opacity ?? 0.22,
      "fill-outline-color": options.outlineColor ?? "#4f52d8"
    }
  };
  map.addLayer(layer);
}

export function addLineLayer(map: Map, options: LineLayerOptions): void {
  if (map.getLayer(options.id)) return;
  const layer: LineLayerSpecification = {
    id: options.id,
    type: "line",
    source: options.source,
    "source-layer": options.sourceLayer,
    minzoom: options.minzoom,
    maxzoom: options.maxzoom,
    paint: {
      "line-color": options.color ?? "#696cff",
      "line-width": options.width ?? 2,
      "line-opacity": options.opacity ?? 1
    }
  };
  map.addLayer(layer);
}

export function addSymbolLayer(map: Map, options: SymbolLayerOptions): void {
  if (map.getLayer(options.id)) return;
  const layer: SymbolLayerSpecification = {
    id: options.id,
    type: "symbol",
    source: options.source,
    "source-layer": options.sourceLayer,
    minzoom: options.minzoom,
    maxzoom: options.maxzoom,
    layout: {
      ...(options.iconImage ? { "icon-image": options.iconImage } : {}),
      ...(options.iconSize ? { "icon-size": options.iconSize } : {}),
      ...(options.textField ? { "text-field": options.textField } : {}),
      ...(options.textSize ? { "text-size": options.textSize } : {}),
      "icon-allow-overlap": true,
      "text-allow-overlap": false
    },
    paint: {
      ...(options.textColor ? { "text-color": options.textColor } : {})
    }
  };
  map.addLayer(layer);
}

export function addLabelLayer(map: Map, options: LabelLayerOptions): void {
  if (map.getLayer(options.id)) return;
  const layer: SymbolLayerSpecification = {
    id: options.id,
    type: "symbol",
    source: options.source,
    "source-layer": options.sourceLayer,
    minzoom: options.minzoom,
    maxzoom: options.maxzoom,
    layout: {
      "text-field": options.textField,
      "text-size": options.textSize ?? 12,
      "text-allow-overlap": false
    },
    paint: {
      "text-color": options.textColor ?? "#1f2937",
      "text-halo-color": options.haloColor ?? "#ffffff",
      "text-halo-width": options.haloWidth ?? 1.5
    }
  };
  map.addLayer(layer);
}

export async function ensureImage(map: Map, name: string, url: string): Promise<void> {
  if (map.hasImage(name)) return;
  const image = await map.loadImage(url);
  if (!map.hasImage(name)) map.addImage(name, image.data);
}
