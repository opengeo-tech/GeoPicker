
# Configuration

The main configuration file is `/server/config.yml`
this file is parsed by `server/parserConfig.js`, which substitutes `${VAR}` placeholders with values from environment variables (falling back to the defaults in `defaultsEnvVars`) and then merges the environment-specific block (`prod:`/`dev:`) selected by `NODE_ENV`. Environment variables can be set via docker-compose.yml

## Environments

The `prod:` and `dev:` blocks override the base config depending on `NODE_ENV` (any value other than `dev` selects `prod`), for example:

```yaml
## Production/Dockerized environment config override
prod:
  port: 8080
  host: 0.0.0.0
  datapath: '/data' #default path in Docker container

## Development environment config override
dev:
  port: 9090
  host: 127.0.0.1
  datapath: './tests/data'
```

this is why the server listens on port `8080` inside the Docker container and on `9090` in development mode (`npm run dev`).


## Datasets

It is the configuration section that defines the `default dataset` and all other datasets available in the api.
Note that some of these(ex. `altitude: elevation`,`ele: elevation`) may be aliases of the same resource has more names.

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
  ## load from same Geotif different bands
  veneto_elevation:
    path: veneto_30m_2bands_ele_aspect.tif
    band: 1
  veneto_aspect:
    path: veneto_30m_2bands_ele_aspect.tif
    band: 2
  ## if path not exists not listed in the endpoint /datasets
  nope:
    path: this-file-not-exists.tif
```

## Fastify Config

Options passed directly to the [Fastify instance config](https://www.fastify.io/docs/latest/Reference/Server/#initialconfig)

```yaml
fastifyConf:
  maxParamLength: 1024
  logger:
    level: 'info'
    transport:
      target: 'pino-pretty
```

## Defaults values for environments variables

these values can be set with environment variables or following their default values in the config file.

```yaml
defaultsEnvVars:
  PREFIX: '/'
  DEMO_PAGE: false
  DATASET_DEFAULT: 'test'
```

## Demo page

Allows you to enable a simple user interface to interact with GeoPicker API implementing all its features.
In the official [docker image](https://hub.docker.com/r/stefcud/geopicker) it is disabled by default you can be enable by environment variable `DEMO_PAGE=true`
In development mode is enabled to allow the user tests.

```yaml
demopage:
  enabled: true
```

## Validation

Disabling input validation by json-schema, speedup the responses but not valid input values
```yaml
validation: false
```

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