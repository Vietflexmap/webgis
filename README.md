# Vietflex WebGIS

Reusable WebGIS foundation for the Vietflex ecosystem.

This repository extracts durable GIS behavior from existing Vietflex applications into small, testable modules instead of keeping map logic, UI, API calls and domain logic inside one monolithic page.

## Architecture

~~~text
                         Vietflex WebGIS
                               |
              +----------------+----------------+
              |                                 |
      @vietflex/webgis                    vietflex.webgis
       TypeScript/Web                       Python/GIS
              |                                 |
      MapLibre + Turf                    pyproj + Shapely
              |                                 |
   layers / measure / registry       CRS / geometry / tiles
              |                                 |
              +---------------+-----------------+
                              |
                         application plugins
                              |
                 Tan Thuan / Vinh Long / ...
~~~

## Packages

- packages/webgis - browser WebGIS SDK: MapLibre map creation, layer factories, layer registry, feature interaction, measurement tools, parcel helpers and provider adapters.
- packages/python - Python GIS SDK exposed as vietflex.webgis: CRS transformation, geometry measurement, tile utilities, provider parsing and server-side layer registry.
- examples/basic - minimal MapLibre application consuming @vietflex/webgis.

## Design rules

1. Core is provider independent. No hard-coded locality API, tile host, user or province.
2. Domain logic is configuration. Schools, parcels, public land and permits are plugins/configuration.
3. CRS parameters are explicit. The Python package never guesses a VN-2000 CRS from a province name.
4. Map setup is idempotent where practical.
5. Pure logic is testable without a browser.
6. GitHub remains the source of truth; deployment providers are replaceable.

## Web development

~~~bash
npm install
npm run typecheck
npm test
npm run build
~~~

## Python development

~~~bash
python -m pip install -e "packages/python[dev]"
pytest packages/python/tests
~~~

## Migration

The supplied legacy WebGIS contained reusable behavior for MapLibre vector sources/layers, measurement, parcel highlighting, Google Maps coordinate extraction and WGS84/VN-2000 conversion. This repository reimplements those behaviors as independent modules. Application-specific endpoints and data are intentionally not copied.

See docs/migration-from-monolith.md.

## License

MIT for code authored in this repository. Third-party libraries and imported datasets/assets keep their own licenses. See NOTICE.md.
