import { describe, expect, it } from "vitest";
import { expandXYZ, lonLatToTile, tileBounds } from "../src/tiles/xyz";

describe("XYZ helpers", () => {
  it("expands templates", () => {
    expect(
      expandXYZ("https://tiles.test/{z}/{x}/{y}.pbf", { z: 5, x: 25, y: 14 })
    ).toBe("https://tiles.test/5/25/14.pbf");
  });

  it("keeps a point inside its tile bounds", () => {
    const tile = lonLatToTile(106.7, 10.8, 10);
    const bounds = tileBounds(tile);
    expect(106.7).toBeGreaterThanOrEqual(bounds.west);
    expect(106.7).toBeLessThanOrEqual(bounds.east);
    expect(10.8).toBeGreaterThanOrEqual(bounds.south);
    expect(10.8).toBeLessThanOrEqual(bounds.north);
  });
});
