# Architecture

## Goal

Make Vietflex WebGIS reusable across projects without coupling the core to one locality, backend or deployment provider.

## Browser SDK

Responsibilities: MapLibre creation, vector/GeoJSON sources, common layers, visibility, layer registry, feature picking, measurement, parcel helpers, provider parsing and XYZ tile math.

It must not know what a school, public-land parcel or construction permit means.

## Python SDK

Responsibilities: coordinate transformation, geodesic geometry measurement, XYZ tile math, provider parsing and a server-side layer registry.

VN-2000 transformations require an explicit authoritative target CRS.

## Dependency direction

~~~text
apps/plugins -> @vietflex/webgis
apps/plugins -> vietflex.webgis

@vietflex/webgis -X-> application endpoints
vietflex.webgis -X-> application database
~~~

The core never imports an application.
