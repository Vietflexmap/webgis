import type { Map } from "maplibre-gl";

export function setLayerVisibility(map: Map, layerId: string, visible: boolean): void {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
}

export function bindLayerVisibility(
  map: Map,
  checkbox: HTMLInputElement,
  layerIds: string[]
): () => void {
  const apply = () => {
    for (const layerId of layerIds) setLayerVisibility(map, layerId, checkbox.checked);
  };
  checkbox.addEventListener("change", apply);
  apply();
  return () => checkbox.removeEventListener("change", apply);
}
