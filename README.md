GeoPicker
==========

![geopicker](docs/cover_600.png)

Geospatial dataset picker via fast Api Rest interface written in [NodeJs for GDAL](https://github.com/mmomtchev/node-gdal-async) bindings and [Fastify](https://www.fastify.io/)

- [Online Demo Map](https://opengeo.tech/geopicker)

- [Swagger API](https://opengeo.tech/geopicker/docs)

- [Article about this project](https://stefcud.medium.com/geopicker-bf4c4321c9ec)

## Scope

GeoPicker is essentially an advanced **elevation service**: given one or more `lon,lat` coordinates, it reads the corresponding pixel values (elevation or any other raster band) from the configured datasets (e.g. GeoTIFF DEMs) through GDAL, and returns them in the same shape the request came in.

It is designed to offer the widest possible range of request methods and input/output formats — coordinates in the URL, JSON objects, arrays of locations, GeoJSON geometries, encoded polylines, GPX — so that any client can integrate it without adapting its own data model. Endpoints and parameters follow the conventions of already existing elevation services, gathered here into a single complete and coherent API.

Beyond value picking, it provides supporting geometry functions: densify, simplify, precision rounding, contour lines and on-the-fly metadata (length, direction, centroid, bbox).

The `index.html` demo page exercises the whole API browser-side, using LeafletJs as basemap and jQuery.

## Features
- **Large API Rest**: ergonomic endpoints suitable for any type of use case
- **Validation**: full validation of endpoint and parameters via **JSON-Schema** which allows output optimization
- **Configuration**: friendly configs and to help devs in many deployment contexts
- **Formats**: support for different geospatial input and output formats
- **Compression**: configurable output compression if client accept encoding: deflate,gzip

and includes some other additional functions:

- **Densify**: add more interpolated points in input coordinates, this improves the display on an elevation graph, adding intermediate positions at a minimum fixed distance.
- **Simplify**: unlike densify it removes points that are too close together from coordinates.
- **Precision**: alter the coordinates precision digits to lossily reduce the size of a geometry.
- **Height**: add the vertical distance from the ground, if input has elevation add a fourth coordinate with this value.
- **Metadata**: get on the fly metadata informations for a geometry (ex. length, direction, bbox, centroid, middlepoint)

## API Rest endpoints

The [API](https://opengeo.tech/geopicker/docs) is work in progress.
This basic structure can be extended starting from the environment variable `PREFIX` which by default `/`

(✔️ Work ❌ TODO 🚧 Work in Progress)

|Status|Method| Path                 | Return | Description |
|------|------|----------------------|--------|-------------|
|  ✔️  | GET  | /                    | html   | default demo map page if enabled by env var `DEMO_PAGE=true` |
|  ✔️  | GET  | /status              | object | service status, versions, datasets |
|  ✔️  | GET  | /datasets            | array  | list available datasets and their attributes |
|  ✔️  | GET  | /datasets/:datasetId | object | search dataset by id |
|  ✔️  | GET  | /datasets/:lon/:lat  | array  | search dataset contains `lon`,`lat` |
|  ✔️  | GET  | /:datasetId          | object | show attributes of a certain dataset by id |
|     |      |                      |        |             |
|  ✔️  | GET  | /:datasetId/:lon/:lat  | array  | get single location value of dataset, densify not supported|
|  ✔️  | GET  | /:datasetId/:locations | array  | locations is a string (format: `lon,lat|lon,lat|lon,lat`), densify not supported |
|     |      |                      |        |             |
|  ✔️  | POST | /:datasetId/lonlat   | arrays | accept array or object in body |
|  ✔️  | POST | /:datasetId/locations| arrays | accept array or object of locations in body (format is `[[lon,lat],[lon,lat],[lon,lat]]`) |
|  ✔️  | POST | /:datasetId/geometry | object | geojson Point or LineString in body (support feature/geometry/f.collection)|
|     |      |                      |        |             |
|  ✔️  | GET  | /:datasetId/contour/:lon/:lat | object | get geojson LineString of contour line for a given location value |
|  ✔️  | GET  | /metadata/:locations | object | return info about direction, length, centroid, middlepoint of locations |
|  ✔️  | POST | /metadata/geometry   | object | return info about direction, length, centroid, middlepoint of geometry |

### Global Parameters

|Status|Parameter | Default  | Description |
|------|----------|----------|-------------|
|  ✔️   | precision| `input`  | rounded to digits decimal precision |
|  ✔️   | format   | `input`  | output format conversion |
|  ✔️   | densify  | `input`  | enable densification of points in the result |
|  ✔️   | simplify | `input`  | enable simplication geometry of the result |

Some behaviors to know about parameters are that:

- `precision` and `densify` parameters is only supported by endpoints and formats that return coordinates
- `datasetId` can have the value `default` to referring the main dataset defined in config
- from version v1.6.1 `/<datasetId>/...` is the same of `/datasets/<datasetId>/...` `/datasets/` is implicit.

### Formats

If the `format` parameter is not specified the default behavior is to output the same format as the input

- **input** format can be specified by `Content-type:` header in request
- **output** format can be specified by `format` parameter

the support for various input and output formats is summarized in the table

| Value     | In |Out | Description |
|-----------|----|----|-------------|
| `input`   | ✔️ | ✔️ | means the same format as the input data |
| `array`   | ✔️ | 🚧 | each location is `Array` and a Z dimension as value `[lon,lat,val]` |
| `json`    | ✔️ | 🚧 | each location is `Object` having `lon`,`lat` and `val` attributes   |
| `geojson` | ✔️ | 🚧 | standard GeoJSON objects `Feature`, `Geometry` with a Z dimension in `coordinates` as value |
| `polyline`| 🚧 | ✔️ | [Encoded Polyline Algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) |
| `gpx`     | 🚧 | ✔️ | GPS eXchange Format is an XML textual format |
| `csv`     | ❌ | ❌ | Comma-separated values is an textual format  |
| `kml`     | ❌ | ❌ | Keyhole Markup Language is an XML format for Google Earth|

each endpoint has its own default format, for example endpoint `/dataset/lon/lat` return a simple array of one value.

# Architecture

The repository has 3 independent npm packages, linked as [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) from the root `package.json`:

- `lib/` core logic defining utils and GDAL bindings
- `cli/` standalone CLI (`cli/bin/geopicker-cli`) for dataset get/set, config validation and other side operations; declared as a dependency of `server/` and installed by npm as the `geopicker` command
- `server/` a standard Fastify HTTP server defining routes, plugins and schemas for the API Rest endpoints
- `index.html` demo page with LeafletJs map that demostrates the usage of the API Rest endpoints

Other folders: `docs/` extended documentation, `tests/` sample datasets and benchmarks

# Usage

Running by official [Docker image](https://hub.docker.com/r/stefcud/geopicker):

```bash
docker run -v "/$(pwd)/tests/data:/data" -e DEMO_PAGE=true -p 8080:8080 stefcud/geopicker
```

then browse the demo page: http://localhost:8080/ (in production the server listens on port `8080`, see `prod:` section in `server/config.yml`)

The `geopicker` command is also available inside the running container, for example:

```bash
docker exec <container> geopicker validate-config
docker exec <container> geopicker -d /data/trentino-altoadige_dem_90m.tif -g "11.123,46.123"
```

More details about the Docker image structure, docker-compose and custom deployments in [docs docker](./docs/docker.md)

Running from source code in development mode, requirements: _nodejs 18.x_ > , _npm 8.x_ > and _glibc 2.28_ (_Ubuntu 20.x_ > ):

```bash
npm install
npm run dev
```

`npm install` at the repository root installs `server/` and `cli/` too, via [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces).
Then browse the demo page (in dev mode the server listens on port `9090`): http://localhost:9090/

## Configuration

Full configuration options can be found in [docs config](./docs/config.md)

## CLI

Command Line interface is useful for side management operations, for example inside docker container, and its config validation tool.
The `geopicker` command is installed by npm as bin of the `cli/` workspace and is available by name inside the Docker container:

```bash
$ geopicker --help
$ geopicker validate-config custom.config.yml
```

Full CLI options can be found in [docs cli](./docs/cli.md)

### Requests Example

Get single location exchanging a few bytes:
```bash
 $ curl "http://localhost:9090/default/11.123/46.123"

[195]
```

More request examples (POST body, locations, GeoJSON geometry, densify) are documented in [docs/examples.md](./docs/examples.md)

## Development

some useful tools for contributors `npm run <scriptname>`

- `start` run in production mode
- `dev` run in development mode
- `lint` run eslint on the whole repo
- `validate-custom-config` validate `server/custom.config.yml` via the cli
- `docker-build` build the docker image
- `docker-up` run in local docker-compose container
- `bench` run benchmarks
- `npm publish .` build and publish new docker image

## Benchmarks

Benchmarks metrics, methodology and results are documented in [docs/benchmarks.md](./docs/benchmarks.md)

# Roadmap

for details see the descriptions in the [Roadmap issues](https://github.com/opengeo-tech/geopicker/labels/Roadmap)

|Status| Goal        |
|------|-------------|
|  ✔️  | Swagger Documentation Interface |
|  ✔️  | manage multiple datasets |
|  ✔️  | command line interface |
|  ✔️  | enable densify function |
|  ✔️  | enable simply function |
|  🚧  | extend benchmarks for any endpoints |
|  🚧  | ES6 modules |
|  ❌  | OGC API Features endpoint |
|  ❌  | unit testing |
|  ❌  | support vector format in datasets, such as shapefile |
|  ❌  | limit access by api key |
|  ❌  | caching responses |
|  ❌  | interfaces: websocket, jsonrpc |

## Copyright

Created by [Stefano Cudini](https://github.com/stefanocudini) [@zakis](https://twitter.com/zakis)
Distributed under the [BSD 2-Clause](https://opensource.org/licenses/BSD-2-Clause) license.
