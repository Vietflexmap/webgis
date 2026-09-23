"""Geometry measurement helpers."""

from __future__ import annotations

from dataclasses import dataclass

from pyproj import Geod
from shapely.geometry import LineString, Polygon
from shapely.geometry.base import BaseGeometry

_GEOD = Geod(ellps="WGS84")


@dataclass(frozen=True, slots=True)
class EdgeMeasurement:
    index: int
    start: tuple[float, float]
    end: tuple[float, float]
    midpoint: tuple[float, float]
    meters: float


def geodesic_length(geometry: BaseGeometry) -> float:
    """Return geodesic length or perimeter in meters for lon/lat geometry."""
    return float(_GEOD.geometry_length(geometry))


def geodesic_area(geometry: Polygon) -> float:
    """Return absolute geodesic polygon area in square meters."""
    area, _ = _GEOD.geometry_area_perimeter(geometry)
    return float(abs(area))


def edge_measurements(polygon: Polygon) -> list[EdgeMeasurement]:
    """Measure every exterior polygon edge geodesically."""
    coords = list(polygon.exterior.coords)
    result: list[EdgeMeasurement] = []
    for index, (start, end) in enumerate(zip(coords, coords[1:])):
        line = LineString([start, end])
        midpoint = line.interpolate(0.5, normalized=True)
        result.append(
            EdgeMeasurement(
                index=index,
                start=(float(start[0]), float(start[1])),
                end=(float(end[0]), float(end[1])),
                midpoint=(float(midpoint.x), float(midpoint.y)),
                meters=geodesic_length(line),
            )
        )
    return result
