import maplibregl, { type Map, type MapOptions } from "maplibre-gl";

export interface VietflexMapOptions extends MapOptions {
  navigationControl?: boolean;
  scaleControl?: boolean;
  geolocateControl?: boolean;
}

export function createMap(options: VietflexMapOptions): Map {
  const {
    navigationControl = true,
    scaleControl = true,
    geolocateControl = false,
    ...mapOptions
  } = options;

  const map = new maplibregl.Map(mapOptions);

  if (navigationControl) {
    map.addControl(new maplibregl.NavigationControl(), "top-right");
  }
  if (scaleControl) {
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
  }
  if (geolocateControl) {
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }),
      "top-right"
    );
  }
  return map;
}
