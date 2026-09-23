export interface TileCoordinate {
  z: number;
  x: number;
  y: number;
}

export interface TileBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function assertXYZTemplate(template: string): void {
  for (const token of ["{z}", "{x}", "{y}"]) {
    if (!template.includes(token)) throw new Error("XYZ template is missing " + token);
  }
}

export function expandXYZ(template: string, tile: TileCoordinate): string {
  assertXYZTemplate(template);
  return template
    .replaceAll("{z}", String(tile.z))
    .replaceAll("{x}", String(tile.x))
    .replaceAll("{y}", String(tile.y));
}

export function lonLatToTile(lng: number, lat: number, z: number): TileCoordinate {
  const safeLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (safeLat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);
  return { z, x: clamp(x, 0, n - 1), y: clamp(y, 0, n - 1) };
}

export function tileBounds(tile: TileCoordinate): TileBounds {
  const n = 2 ** tile.z;
  const west = (tile.x / n) * 360 - 180;
  const east = ((tile.x + 1) / n) * 360 - 180;
  const north = tileYToLatitude(tile.y, n);
  const south = tileYToLatitude(tile.y + 1, n);
  return { west, south, east, north };
}

function tileYToLatitude(y: number, n: number): number {
  return (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
