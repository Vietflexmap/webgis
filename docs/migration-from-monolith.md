# Migration from the monolithic WebGIS

The supplied application mixed HTML/CSS, MapLibre setup, Turf calculations, vector-tile definitions, click handlers, API calls, VN-2000 conversion and locality-specific presentation in one page.

| Legacy behavior | New module |
|---|---|
| addVectorSource | layers/sources.ts |
| fill/line/symbol/label helpers | layers/factory.ts |
| checkbox layer toggles | layers/visibility.ts |
| repeated queryRenderedFeatures branches | LayerRegistry + FeatureInteraction |
| repeated feature API calls | ApiClient |
| distance/area tool | MeasureTool |
| parcel edge labels/highlight/fit | geometry/parcel.ts |
| Google Maps coordinate extraction | providers/googleMaps.ts |
| manual WGS84/VN-2000 math | Python VN2000Transformer using pyproj |

Not migrated into core: locality-specific names/UI, private endpoints/tiles, account logic, legacy Leaflet fragments, duplicated UI utilities and unverified manual datum/projection formulas.

Recommended flow: define domain layers as configuration, use one FeatureInteraction handler, load feature data with ApiClient, render domain details in the application and perform CRS work in Python/backend.
