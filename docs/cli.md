
# CLI

GeoPicker ships a command line entry point `cli/bin/geopicker-cli` (installed as the `geopicker` command by npm, e.g. inside the Docker container), backed by `cli/geopicker-cli.js`.
The CLI is the `cli/` npm workspace, declared as a dependency of `server/`, so npm installs it as `node_modules/.bin/geopicker`.

```bash
node cli/bin/geopicker-cli --help
```

Inside the Docker container the command is available by name from any directory:

```bash
docker exec <container> geopicker --help
```

## Dataset get/set

Read or write values from/into a dataset file (e.g. a GeoTIFF), the default action when no other command is given.

```bash
geopicker -d path/to/dataset.tif -g "11.01,46.01"
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
geopicker --get 11.01,46.01 -v -t -d tests/data/trentino-altoadige_dem_90m.tif
geopicker --set -v -t -d tests/data/trentino-altoadige_dem_90m.tif -i tests/data/point_feature.geojson
```

## config-validate

Validate a `config.yml` file against the GeoPicker config schema (`server/schemas/config.js`), without starting the server.

```bash
geopicker config-validate [file]
```

`file` defaults to `server/config.yml`. Prints an error and exits with code 1 if the config is invalid; see also `npm run validate-custom-config` (validates `server/custom.config.yml`).

## config-show

Same validation as `config-validate`, then prints the parsed config object as JSON — useful to see the final config after environment variable substitution and `prod:`/`dev:` merging.

```bash
geopicker config-show [file]
```

## server-start

Start the GeoPicker HTTP server, equivalent to `npm start`.

```bash
geopicker server-start
```

## server-status

Show the status JSON of the running GeoPicker HTTP server, the same returned by its `/status` endpoint (host, port and prefix are read from the config). Prints an error and exits with code 1 if the server is not reachable.

```bash
geopicker server-status
```

## completion

Generate a bash completion script for the `geopicker` command. The script is built at runtime from the commands and options currently registered in the CLI, so it is always in sync — regenerate it after upgrading GeoPicker.

```bash
geopicker completion > /etc/bash_completion.d/geopicker   # system-wide
source <(geopicker completion)                            # only current shell
```

In the official Docker image the completion is already installed, see [Docker](docker.md).
