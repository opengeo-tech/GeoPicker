
# CLI

GeoPicker ships a command line entry point `cli/bin/geopicker` (installed as the `geopicker` command by npm, e.g. inside the Docker container), backed by `cli/geopicker-cli.js`.
The CLI is the `cli/` npm workspace, declared as a dependency of `server/`, so npm installs it as `node_modules/.bin/geopicker`.

```bash
node cli/bin/geopicker --help
```

Inside the Docker container the command is available for management and debugging, e.g. to validate the config file or check datasets:

```bash
docker exec <container> geopicker --help
```

## Index

- [Execute get/set](#execute-getset)
- Config commands:
  - [config-validate](#config-validate)
  - [config-show](#config-show)
  - [config-generate](#config-generate)
- Server commands:
  - [server-start](#server-start)
  - [server-status](#server-status)
- [bash-completion](#bash-completion)

## Execute get/set

Read or write values from/into a dataset file (e.g. a GeoTIFF), without rest api or server.

```bash
geopicker -d path/to/dataset.tif -g "11.01,46.01"
```

Options:

- `-d, --dataset <file>` input dataset file like a raster `.tif` (required)
- `-g, --get <lon,lat>` pick only values from dataset by `"lon,lat"` param (multiple locations separated by `_`)
- `-s, --set` set properties in the input geojson picking values from dataset
- `-i, --input-file <file>` input geojson file
- `-t, --timing` print processing time
- `-v, --verbose` print verbose output

Examples:

```bash
geopicker --get 11.01,46.01 -v -t -d tests/data/trentino-altoadige_dem_90m.tif
geopicker --set -v -t -d tests/data/trentino-altoadige_dem_90m.tif -i tests/data/linestring_10pt_feature.geojson
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

## config-generate

Interactively generate a new config file: one sequential prompt for each setting documented in [Configuration](config.md), press ENTER to skip a question keeping the default value of `server/config.yml`. For the `datasets` section the command asks for the folder where the dataset files are located (defaults to the chosen `datapath`), scans it for `.tif`/`.tiff` files and proposes the found list, asking confirmation before adding each one.

```bash
geopicker config-generate [file]
```

Options:

- `-p, --datapath <dir>` base directory of the dataset files, skips the `datapath` question (the rest stays interactive)
- `-D, --default <file>` dataset file to set as `datasets.default`, skips the default id question; it accepts a path or just the file name, and fails if that file is not among the scanned datasets
- `-P, --port <port>` TCP port the server listens on, skips the `port` question
- `-y, --yes` answer yes to all the questions keeping the default values, and overwrite `file` if it already exists

An excerpt of the interactive session:

```bash
$ geopicker config-generate config.yml
GeoPicker config generator, press ENTER to accept the [default] values
datapath, base directory of the dataset files (TAB to autocomplete) [/data]: ./tests/data
datasets, folder to scan for dataset files (TAB to autocomplete) [./tests/data]:
found 2 dataset files in ./tests/data:
  test_4611_dem.tif
  trentino-altoadige_dem_90m.tif
add dataset "test_4611_dem" (test_4611_dem.tif) (y/n) [y]:
add dataset "trentino-altoadige_dem_90m" (trentino-altoadige_dem_90m.tif) (y/n) [y]: n
datasets default id [test_4611_dem]:
resulting datasets config:
datasets:
  test_4611_dem:
    path: test_4611_dem.tif
    band: 1
  default: test_4611_dem
...
```

The resulting YAML is validated against the config schema (`server/schemas/config.js`) before being saved; if `file` is omitted it is printed to stdout (prompts go to stderr). If `file` already exists, the command asks for confirmation before overwriting it.

Combining the options the command runs unattended, which is how the [benchmark](benchmarks.md) workspace builds its own config: every dataset found in the scanned folder is added and the file is overwritten without asking, so it can safely be re-run.

```bash
geopicker config-generate --yes -p ./tests/data -D test_4611_dem.tif config.yml
```

## server-start

Start the GeoPicker HTTP server.

```bash
geopicker server-start [-c|--config <file>]
```

`--config` defaults to `./config.yml` in the directory where the command is launched. Note this differs from `npm start` (which runs `server/server.js` directly and uses `server/config.yml`); the official Docker image passes `--config server/config.yml` in its `CMD`.

## server-status

Show the status JSON of the running GeoPicker HTTP server, the same returned by its `/status` endpoint (host, port and prefix are read from the config). Prints an error and exits with code 1 if the server is not reachable.

```bash
geopicker server-status
```

## bash-completion

Generate a bash completion script for the `geopicker` command. The script is built at runtime from the commands and options currently registered in the CLI, so it is always in sync — regenerate it after upgrading GeoPicker.

```bash
geopicker bash-completion > /etc/bash_completion.d/geopicker   # system-wide
source <(geopicker bash-completion)                            # only current shell
```

In the official Docker image the completion is already installed, see [Docker](docker.md).
