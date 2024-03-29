
# Configuration

The main configuration file is `/server/config.yml`
this file is compiled with a special library [configyml](https://github.com/stefanocudini/configyml) that take some options values from environment variables that can be set via docker-compose.yml


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
  alps:
    path: alps_dem_10m.tif
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