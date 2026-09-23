import type { Map, MapLayerMouseEvent } from "maplibre-gl";
import { LayerRegistry } from "../registry/LayerRegistry";
import type { PickedFeature } from "../types";

export class FeatureInteraction {
  private readonly map: Map;
  private readonly registry: LayerRegistry;
  private clickListener?: (event: MapLayerMouseEvent) => void;

  constructor(map: Map, registry: LayerRegistry) {
    this.map = map;
    this.registry = registry;
  }

  pick(event: MapLayerMouseEvent): PickedFeature | null {
    const layers = this.registry.queryLayerIds().filter((id) => Boolean(this.map.getLayer(id)));
    if (!layers.length) return null;

    const feature = this.map.queryRenderedFeatures(event.point, { layers })[0];
    if (!feature) return null;

    const definition = this.registry.getByQueryLayerId(feature.layer.id);
    if (!definition) return null;

    const rawId = feature.properties?.[definition.idProperty ?? "gid"];
    const id = typeof rawId === "string" || typeof rawId === "number" ? rawId : null;
    return { definition, feature, id };
  }

  select(picked: PickedFeature): void {
    const definition = picked.definition;
    if (!definition.selectedLayerId || picked.id === null) return;
    if (!this.map.getLayer(definition.selectedLayerId)) return;
    this.map.setFilter(definition.selectedLayerId, [
      "==",
      ["get", definition.idProperty ?? "gid"],
      picked.id
    ]);
  }

  clearSelection(): void {
    for (const definition of this.registry.entries()) {
      if (!definition.selectedLayerId || !this.map.getLayer(definition.selectedLayerId)) continue;
      this.map.setFilter(definition.selectedLayerId, ["==", ["literal", 1], 0]);
    }
  }

  bindClick(
    handler: (picked: PickedFeature, event: MapLayerMouseEvent) => void
  ): () => void {
    this.unbindClick();
    this.clickListener = (event) => {
      const picked = this.pick(event);
      if (!picked) return;
      this.select(picked);
      handler(picked, event);
    };
    this.map.on("click", this.clickListener);
    return () => this.unbindClick();
  }

  unbindClick(): void {
    if (!this.clickListener) return;
    this.map.off("click", this.clickListener);
    this.clickListener = undefined;
  }
}
