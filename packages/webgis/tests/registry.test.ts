import { describe, expect, it } from "vitest";
import { LayerRegistry } from "../src/registry/LayerRegistry";

describe("LayerRegistry", () => {
  it("registers and resolves layers", () => {
    const registry = new LayerRegistry([
      { key: "schools", queryLayerId: "school-symbol" }
    ]);
    expect(registry.get("schools")?.idProperty).toBe("gid");
    expect(registry.getByQueryLayerId("school-symbol")?.key).toBe("schools");
  });

  it("excludes disabled layers", () => {
    const registry = new LayerRegistry([
      { key: "a", queryLayerId: "a-layer" },
      { key: "b", queryLayerId: "b-layer", enabled: false }
    ]);
    expect(registry.queryLayerIds()).toEqual(["a-layer"]);
  });
});
