
# CLI

GeoPicker ships a command line entry point `bin/geopicker-cli` (installed as the `geopicker` command when the package is installed globally or linked), backed by `cli/geopicker-cli.js`.

```bash
node bin/geopicker-cli --help
```

## Dataset get/set

Read or write values from/into a dataset file (e.g. a GeoTIFF), the default action when no other command is given.

```bash
geopicker-cli -d path/to/dataset.tif -g "11.01,46.01"
```

Options:

- `-d, --dataset <file>` input dataset file like a raster `.tif` (required)
- `-g, --get <lonlat>` pick only values from dataset by `"lon,lat"` param (multiple locations separated by `_`)
- `-s, --set` set properties in the input geojson picking values from dataset
- `-i, --input-file <file>` input geojson file
- `-t, --timing` print processing time
- `-v, --verbose` print verbose output

Examples:

```bash
geopicker-cli --get 11.01,46.01 -v -t -d tests/data/trentino-altoadige_dem_90m.tif
geopicker-cli --set -v -t -d tests/data/trentino-altoadige_dem_90m.tif -i tests/data/point_feature.geojson
```

## validate-config

Validate a `config.yml` file against the GeoPicker config schema (`server/schemas/config.js`), without starting the server.

```bash
geopicker-cli validate-config [file]
```

`file` defaults to `server/config.yml`. Prints an error and exits with code 1 if the config is invalid; see also `npm run validate-custom-config` (validates `server/custom.config.yml`).

## show-config

Same validation as `validate-config`, then prints the parsed config object as JSON — useful to see the final config after environment variable substitution and `prod:`/`dev:` merging.

```bash
geopicker-cli show-config [file]
```

## start-server

Start the GeoPicker HTTP server, equivalent to `npm start`.

```bash
geopicker-cli start-server
```
