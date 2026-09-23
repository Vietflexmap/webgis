"""XYZ tile math and template helpers."""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Tile:
    z: int
    x: int
    y: int


@dataclass(frozen=True, slots=True)
class TileBounds:
    west: float
    south: float
    east: float
    north: float


def expand_xyz(template: str, tile: Tile) -> str:
    for token in ("{z}", "{x}", "{y}"):
        if token not in template:
            raise ValueError(f"XYZ template is missing {token}")
    return (
        template.replace("{z}", str(tile.z))
        .replace("{x}", str(tile.x))
        .replace("{y}", str(tile.y))
    )


def lonlat_to_tile(lng: float, lat: float, z: int) -> Tile:
    lat = max(-85.05112878, min(85.05112878, lat))
    n = 2**z
    x = int(((lng + 180.0) / 360.0) * n)
    lat_rad = math.radians(lat)
    y = int(((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0) * n)
    return Tile(z=z, x=max(0, min(n - 1, x)), y=max(0, min(n - 1, y)))


def tile_bounds(tile: Tile) -> TileBounds:
    n = 2**tile.z
    west = tile.x / n * 360.0 - 180.0
    east = (tile.x + 1) / n * 360.0 - 180.0
    north = _tile_y_to_lat(tile.y, n)
    south = _tile_y_to_lat(tile.y + 1, n)
    return TileBounds(west=west, south=south, east=east, north=north)


def _tile_y_to_lat(y: int, n: int) -> float:
    return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
