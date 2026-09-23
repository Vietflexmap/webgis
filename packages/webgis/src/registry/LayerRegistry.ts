import type { WebGISLayerDefinition } from "../types";

export class LayerRegistry {
  private readonly definitions = new Map<string, WebGISLayerDefinition>();

  constructor(initial: WebGISLayerDefinition[] = []) {
    for (const definition of initial) this.register(definition);
  }

  register(definition: WebGISLayerDefinition): this {
    if (!definition.key.trim()) throw new Error("Layer key is required");
    if (!definition.queryLayerId.trim()) throw new Error("queryLayerId is required");
    this.definitions.set(definition.key, {
      idProperty: "gid",
      requestParam: "gid",
      enabled: true,
      ...definition
    });
    return this;
  }

  unregister(key: string): boolean {
    return this.definitions.delete(key);
  }

  get(key: string): WebGISLayerDefinition | undefined {
    return this.definitions.get(key);
  }

  getByQueryLayerId(layerId: string): WebGISLayerDefinition | undefined {
    for (const definition of this.definitions.values()) {
      if (definition.queryLayerId === layerId) return definition;
    }
    return undefined;
  }

  entries(): WebGISLayerDefinition[] {
    return [...this.definitions.values()];
  }

  enabled(): WebGISLayerDefinition[] {
    return this.entries().filter((definition) => definition.enabled !== false);
  }

  queryLayerIds(): string[] {
    return this.enabled().map((definition) => definition.queryLayerId);
  }
}
