
# Configuration

The main configuration file is `/server/config.yml`
this file is compiled with a special library [configyml](https://github.com/stefanocudini/configyml) that take some options values from environment variables that can be set via docker-compose.yml

## Datasets

It is the configuration section that defines the `default dataset` and all other datasets available in the api.
Note that some of these(ex. `altitude: elevation`,`ele: elevation`) may be aliases of the same resource has more names.

```yaml
datapath: '/data'
datasets:
  default: elevation
  #aliases of same dataset
  altitude: elevation
  ele: elevation
  elevation:
    path: trentino-altoadige_dem_90m.tif
    band: 1
  aspect:
    path: trentino-altoadige_aspect_90m.tif
    band: 1
  slope:
    path: trentino-altoadige_slope_90m.tif
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

## Demo page

Allows you to enable a simple user interface to interact with GeoPicker API implementing all its features.
In the official [docker image](https://hub.docker.com/r/stefcud/geopicker) it is disabled by default you can be enable by environment variable `DEMO_PAGE=true`
In development mode is enabled to allow the user tests.


```yaml
demopage: true
demopath: '/map'
```