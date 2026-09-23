"""Google Maps URL coordinate parsing without network access."""

from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse


@dataclass(frozen=True, slots=True)
class LatLng:
    lat: float
    lng: float


_DIRECT = re.compile(
    r"^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$"
)
_AT = re.compile(r"@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,|z|/)")
_DATA = re.compile(r"!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)")


def parse_google_maps_url(value: str) -> LatLng | None:
    text = value.strip()
    if not text:
        return None

    for pattern in (_DIRECT, _AT, _DATA):
        match = pattern.search(text)
        if match:
            result = _normalize(float(match.group(1)), float(match.group(2)))
            if result:
                return result

    try:
        query = parse_qs(urlparse(text).query)
    except ValueError:
        return None

    for key in ("query", "destination", "q", "ll"):
        for candidate_text in query.get(key, []):
            match = _DIRECT.search(candidate_text)
            if match:
                result = _normalize(float(match.group(1)), float(match.group(2)))
                if result:
                    return result

    return None


def _normalize(lat: float, lng: float) -> LatLng | None:
    if abs(lat) > 90 or abs(lng) > 180:
        return None
    return LatLng(lat=lat, lng=lng)
