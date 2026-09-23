"""Coordinate reference system helpers.

VN-2000 projects may use different projected CRS definitions. This module
requires the caller to pass an authoritative CRS instead of guessing local
parameters from a province name.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence

from pyproj import CRS, Transformer

CRSLike = str | int | CRS


def transform_xy(
    x: float,
    y: float,
    src_crs: CRSLike,
    dst_crs: CRSLike,
) -> tuple[float, float]:
    transformer = Transformer.from_crs(src_crs, dst_crs, always_xy=True)
    out_x, out_y = transformer.transform(x, y)
    return float(out_x), float(out_y)


def transform_many(
    points: Iterable[Sequence[float]],
    src_crs: CRSLike,
    dst_crs: CRSLike,
) -> list[tuple[float, float]]:
    transformer = Transformer.from_crs(src_crs, dst_crs, always_xy=True)
    result: list[tuple[float, float]] = []
    for point in points:
        if len(point) < 2:
            raise ValueError("Each coordinate must contain at least x and y")
        out_x, out_y = transformer.transform(float(point[0]), float(point[1]))
        result.append((float(out_x), float(out_y)))
    return result


@dataclass(frozen=True, slots=True)
class VN2000Transformer:
    """Bidirectional WGS84 to configured VN-2000 transformer."""

    target_crs: CRSLike
    source_crs: CRSLike = "EPSG:4326"

    def forward(self, lon: float, lat: float) -> tuple[float, float]:
        transformer = Transformer.from_crs(
            self.source_crs, self.target_crs, always_xy=True
        )
        x, y = transformer.transform(lon, lat)
        return float(x), float(y)

    def inverse(self, x: float, y: float) -> tuple[float, float]:
        transformer = Transformer.from_crs(
            self.target_crs, self.source_crs, always_xy=True
        )
        lon, lat = transformer.transform(x, y)
        return float(lon), float(lat)
