from vietflex.webgis import Tile, expand_xyz, lonlat_to_tile, tile_bounds


def test_expand_xyz() -> None:
    assert (
        expand_xyz("https://tiles.test/{z}/{x}/{y}.pbf", Tile(5, 25, 14))
        == "https://tiles.test/5/25/14.pbf"
    )


def test_point_inside_tile_bounds() -> None:
    tile = lonlat_to_tile(106.7, 10.8, 10)
    bounds = tile_bounds(tile)
    assert bounds.west <= 106.7 <= bounds.east
    assert bounds.south <= 10.8 <= bounds.north
