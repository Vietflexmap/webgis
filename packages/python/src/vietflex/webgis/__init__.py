"""Reusable GIS primitives for Vietflex WebGIS."""

from .crs import VN2000Transformer, transform_many, transform_xy
from .geometry import EdgeMeasurement, edge_measurements, geodesic_area, geodesic_length
from .providers.google_maps import LatLng, parse_google_maps_url
from .registry import LayerDefinition, LayerRegistry
from .tiles import Tile, TileBounds, expand_xyz, lonlat_to_tile, tile_bounds

__all__ = [
    "EdgeMeasurement",
    "LatLng",
    "LayerDefinition",
    "LayerRegistry",
    "Tile",
    "TileBounds",
    "VN2000Transformer",
    "edge_measurements",
    "expand_xyz",
    "geodesic_area",
    "geodesic_length",
    "lonlat_to_tile",
    "parse_google_maps_url",
    "tile_bounds",
    "transform_many",
    "transform_xy",
]
