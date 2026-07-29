
# Configuration

The main configuration file is `server/config.yml`, parsed and validated at startup by `server/parserConfig.js`.

## Index

- [How the config is loaded and validated](#how-the-config-is-loaded-and-validated)
- [Performance impact](#performance-impact)
- Settings reference:
  - [defaultsEnvVars](#defaultsenvvars)
  - [Environments: prod and dev](#environments-prod-and-dev)
  - [port and host](#port-and-host)
  - [datapath](#datapath)
  - [prefix](#prefix)
  - [demopage](#demopage)
  - [attribution](#attribution)
  - [fastifyConf](#fastifyconf)
  - [verbose](#verbose)
  - [validation](#validation)
  - [swagger](#swagger)
  - [cors](#cors)
  - [compress](#compress)
  - [status](#status)
  - [maxLocations](#maxlocations)
  - [sepLocs and sepCoords](#seplocs-and-sepcoords)
  - [precision](#precision)
  - [densify](#densify)
  - [simplify](#simplify)
  - [formats](#formats)
  - [datasets](#datasets)
- [More customization](#more-customization)

## How the config is loaded and validated

`server/parserConfig.js` is a standalone replacement of the deprecated `@stefcud/configyml` package. When the server starts (`server/server.js`) the config goes through this pipeline:

1. **File resolution** — the file path comes from the `CONFIG` environment variable (set by the [CLI](cli.md) command `geopicker server-start --config <file>`), falling back to `server/config.yml` when running `npm start`/`npm run dev` directly.
2. **YAML loading** — the `config.yml` file is loaded and parsed.
3. **`${VAR}` substitution** — placeholders are replaced with values from the process environment; when a variable is not set, the defaults declared in [`defaultsEnvVars`](#defaultsenvvars) are used.
4. **Environment merge** — `NODE_ENV` selects the [`prod:` or `dev:` block](#environments-prod-and-dev) (any value other than a development one selects `prod`), which is deep-merged over the base config. This is why the server listens on port `8080` inside the Docker container and on `9090` with `npm run dev`.
5. **Iterative substitution** — placeholders may also reference other keys of the config itself (e.g. `swagger.routePrefix: '${prefix}/docs'`); substitution is repeated until no placeholder is left to resolve.
6. **Runtime keys** — `envId`, `ENVID`, `isDev` and `timestamp` are injected into the final config object.
7. **Validation** — the resulting object is validated with Ajv against the json-schema in `server/schemas/config.js`; the required keys are `port`, `host`, `prefix`, `fastifyConf`, `verbose`, `cors`, `compress`, `swagger`, `demopage` and `datasets`. If the config is invalid the server prints the errors and exits with code 1.

The same validation can be run without starting the server via the [CLI](cli.md) commands `geopicker config-validate` and `geopicker config-show` (the latter also prints the final parsed config, useful to inspect the result of substitution and merging).

## Performance impact

Some settings directly affect throughput and latency; how they act has been checked in the server code and confirmed by benchmarks (see [benchmarks.md](benchmarks.md)):

- **[validation](#validation)** — when `false` the validator compiler is replaced with one that always accepts, so no json-schema check is run on any request. It is the single most direct speed/safety trade-off: faster responses, but malformed locations reach the GDAL layer unchecked.
- **[maxLocations](#maxlocations)** — every location in a request costs one pixel read on the raster, and reads are currently synchronous (they block the event loop, see "async" in the README Roadmap). This limit is what bounds the work a single request can demand; lower it on small servers.
- **[densify](#densify)** — a server-side default here multiplies the number of points (and therefore pixel reads) of every geometry request: a small distance in meters over a long line can turn a few input points into thousands. Prefer `input` as default and let clients opt in per request.
- **[simplify](#simplify)** — works in the opposite direction: fewer points mean fewer reads by subsequent processing, smaller payloads and cheaper format conversion.
- **[precision](#precision)** — negligible CPU cost, but rounding coordinates reduces the response size.
- **[compress](#compress)** — trades CPU for bandwidth. `threshold` avoids compressing small payloads and `global: false` limits compression to the routes that request it; useful for large responses (many locations, contour lines).
- **[fastifyConf](#fastifyconf)** — the `logger` config matters: the `pino-pretty` transport and low levels like `debug` are convenient in development but slow down every request; in production prefer plain output and `info` or higher. `bodyLimit` and `maxParamLength` bound the size of what the server accepts before any processing.
- **[formats](#formats)** — output conversion runs in an `onSend` hook on the already serialized payload, so each conversion is extra work per response; the formats also differ in payload size (`polyline` is by far the most compact, `gpx` XML the most verbose).

Settings with no per-request cost: `verbose` (logs at startup only), `swagger` and `demopage` (serve separate routes), `cors` (a header per response).


## defaultsEnvVars

Default values used for `${VAR}` placeholders when the corresponding variable is not present in the process environment (e.g. not set via `docker-compose.yml`).

```yaml
defaultsEnvVars:
  PREFIX: '/'
  DEMO_PAGE: false
  DATASET_DEFAULT: 'elevation'
```

Use case: run the same `config.yml` in different deployments changing only environment variables, keeping sane defaults in the file.

## Environments: prod and dev

The `prod:` and `dev:` blocks override any base config value depending on `NODE_ENV`. Typical use case: different port, data directory, logging and enabled formats between local development and the Dockerized deployment.

```yaml
## Production/Dockerized environment config override
prod:
  port: 8080
  host: 0.0.0.0
  datapath: '/data' #default path in Docker container

## Development environment config override
dev:
  port: 9090
  host: 0.0.0.0
  datapath: './tests/data'
  verbose: true
```

The `dev` block points `datapath` to `./tests/data`, so local development reads the sample GeoTIFFs already present in the repo.

## port and host

TCP port and address the Fastify server listens on (`fastify.listen` in `server/server.js`). Usually defined per environment in the [`prod:`/`dev:` blocks](#environments-prod-and-dev).

## datapath

Base directory where all [dataset](#datasets) files are looked up; each dataset `path` is relative to it. If the directory does not exist an error is logged at startup. In the Docker image it is `/data`, the mount point for the data volume.

## prefix

URL prefix prepended to every endpoint (routes are registered with it in `server/server.js`). Defaults to `${PREFIX}` (env var, `/` by default). Use case: expose the API under a sub-path behind a reverse proxy, e.g. `PREFIX=/geopicker`.

```yaml
prefix: ${PREFIX}
```

## demopage

Enables the demo map front-end (`index.html`, Leaflet-based) served at `url` (`server/routes/demopage.js`). Disabled by default in the Docker image, can be turned on with the `DEMO_PAGE=true` environment variable; in development mode it is enabled to allow user tests.

```yaml
demopage:
  enabled: ${DEMO_PAGE}
  url: '/'
```

## attribution

Free text describing the service, returned by the `/status` endpoint and used as description in the Swagger front-end. Use case: brand your own deployment.

```yaml
attribution: "GeoPicker - Copyright Stefano Cudini - opengeo.tech"
```

## fastifyConf

Options passed as-is to the [Fastify instance config](https://fastify.dev/docs/latest/Reference/Server/#initialconfig), e.g. `maxParamLength` (long `locations` strings in the URL), `bodyLimit` (max POST body size) and the pino `logger` configuration.

```yaml
fastifyConf:
  maxParamLength: 1024
  bodyLimit: 1048576
  logger:
    level: 'info'
    transport:
      target: 'pino-pretty'
```

## verbose

Boolean, enables the verbose plugin which logs debugging information at startup (the list of registered endpoints). Enabled in the `dev` environment.

```yaml
verbose: false
```

## validation

Boolean, enables input validation of requests by json-schemas (`server/schemas/`). Disabling it speeds up the responses but invalid input locations are no longer rejected.

```yaml
validation: true
```

## swagger

Enables the interactive Swagger documentation front-end, served at `routePrefix` (options by [fastify-swagger](https://github.com/fastify/fastify-swagger)).

```yaml
swagger:
  enabled: true
  routePrefix: '${prefix}/docs'
  docExpansion: 'list'
```

## cors

Cross-origin resource sharing; when `enabled` the whole object is passed to [fastify-cors](https://github.com/fastify/fastify-cors). Use case: restrict `origin` when the API is consumed only by a known web application.

```yaml
cors:
  enabled: true
  origin: '*'
  optionsSuccessStatus: 200
```

## compress

Output compression of responses; when `enabled` the whole object is passed to [fastify-compress](https://github.com/fastify/fastify-compress). Use case: reduce payload size of large responses (many locations, contour lines) at the cost of some CPU.

```yaml
compress:
  enabled: true
  global: false
  threshold: 1024
  encodings:
    - 'deflate'
    - 'gzip'
```

## status

Controls the details exposed by the `/status` endpoint: `config` shows the base configuration values, `stats` shows runtime usage statistics. Use case: disable both in public deployments to avoid leaking configuration details.

```yaml
status:
  config: true
  stats: false
```

## maxLocations

Maximum number of locations accepted in a single request, enforced by the input json-schemas of the `/locations` and `/geometry` endpoints. Use case: protect the server from overly large requests.

```yaml
maxLocations: 10000
```

## sepLocs and sepCoords

Separator characters used to parse the `:locations` URL parameter, between locations and between coordinates respectively (default: `/locations/lon1,lat1|lon2,lat2|...`).

```yaml
sepLocs: '|'
sepCoords: ','
```

## precision

Default number of digits of the coordinates returned in the responses, used when the `precision` query parameter is omitted. `input` means the precision of the input is preserved; `false` disables rounding.

```yaml
precision: input
```

## densify

Default densification distance in meters (new points added along the input geometry), used when the `densify` query parameter is omitted. `input` means no densification beyond the input points; `false` disables it.

```yaml
densify: input
```

## simplify

Default simplification factor from 0 to 1, used when the `simplify` query parameter is omitted. `input` means the geometry is returned as provided; `false` disables it.

```yaml
simplify: input
```

## formats

Output formats allowed for the `format` query parameter, each implemented by a module in `server/formats/` (`input` means: respond in the same format of the input). Use case: expose only the formats your clients need.

```yaml
formats:
  - 'input'
  - 'polyline'
  - 'gpx'
```

## datasets

The configuration section that maps the `datasetId` api parameter to data source files (relative to [`datapath`](#datapath)) and raster bands, and defines the `default` dataset id (`${DATASET_DEFAULT}` env var by default).
Note that some entries (ex. `altitude: elevation`, `ele: elevation`) may be string aliases of the same resource that has more names.

```yaml
datapath: '/data'
## Datasets for `dataset` api parameter
datasets:
  default: ${DATASET_DEFAULT}
  test:
    path: test_4611_dem.tif
    band: 1
  # aliases of same dataset
  altitude: elevation
  elevation:
    path: trentino-altoadige_dem_90m.tif
    band: 1
  ## if path not exists not listed in the endpoint /datasets
  nope:
    path: this-file-not-exists.tif
```

All datasets are opened once at startup; a dataset whose file does not exist on disk is removed from the config with a warning in the server console, instead of raising an error, and is not listed in the `/datasets` endpoint.

## More customization

The Default config file includes some variables read from the execution environment(PREFIX,DATASET_DEFAULT...), but to have a greater
customization it is advisable to build the config.yml file one of your own suitable for the context, this in the Docker execution environment can be done easily
by mounting a volume in the same path which goes to replace the original config:

```yaml
volumes:
  - "../mypath/for/data:/data"
  - "./custom.config.yml:/home/server/config.yml"
```

To check a custom config file before deploying it, or to inspect the final parsed config (after environment variable substitution and `prod:`/`dev:` merging), use the [CLI](cli.md) commands `geopicker config-validate` and `geopicker config-show`.
