from vietflex.webgis import parse_google_maps_url


def test_direct_coordinates() -> None:
    result = parse_google_maps_url("10.2669024,106.3588832")
    assert result is not None
    assert result.lat == 10.2669024
    assert result.lng == 106.3588832


def test_google_at_coordinates() -> None:
    result = parse_google_maps_url(
        "https://www.google.com/maps/place/Test/@10.2678571,106.3577652,17z"
    )
    assert result is not None
    assert result.lat == 10.2678571
    assert result.lng == 106.3577652


def test_invalid_coordinates() -> None:
    assert parse_google_maps_url("100,200") is None
