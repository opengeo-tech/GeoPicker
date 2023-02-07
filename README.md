GeoPicker
==========

![geopicker](docs/cover_600.png)

Geospatial dataset picker via fast Api Rest interface written in [NodeJs for GDAL](https://github.com/mmomtchev/node-gdal-async) bindings and [Fastify](https://www.fastify.io/)

[Online Demo](https://opengeo.tech/geopicker)

## Scope

Geopicker has been specially designed to offer the widest range of formats and methods of data requests that is possible, to adapt to any context of use by the client.
Each endpoint and the parameters it accepts have been designed on the basis of the functioning of already existing services, gathering a complete and coherent collection of APIs.
At present the index.html page contains a large implementation of browser side requests using LeafletJs as basemap and jQuery.

[Article about this project](https://stefcud.medium.com/geopicker-bf4c4321c9ec)

# API Rest endpoints

it's work in progress...
https://gist.github.com/stefanocudini/77f36db813997e057d3fd163cbe04a73

|Status|Method| Path                 | Return | Description |
|------|------|----------------------|--------|-------------|
|  ✔️  | GET  | /                    | html   | demo map page if enabled by env var `DEMO_PAGE=true` |
|  ✔️  | GET  | /status              | object | service status, versions, datasets |
|  ✔️  | GET  | /datasets            | object | list available datasets and their attributes |
|  ✔️  | GET  | /:dataset            | object | show attributes of a certain dataset |
|      |      |                      |        |             |
|  ✔️  | GET  | /:dataset/:lon/:lat  | array  | get single location value of dataset, densify not supported|
|  ✔️  | GET  | /:dataset/:locations | array  | locations is a string (format: `lon,lat|lon,lat|lon,lat`), densify not supported |
|      |      |                      |        |             |
|  ✔️  | POST | /:dataset/lonlat     | arrays | accept array or object in body |
|  ✔️  | POST | /:dataset/geometry   | object | geojson geometry Point or LineString in body
|  ✔️  | POST | /:dataset/locations  | arrays | accept array or object of locations in body (format is `[[lon,lat],[lon,lat],[lon,lat]]`) |
|      |      |                      |        |             |
|  ❌  | GET  | /densify/:locations  | arrays | add more points in list of locations |
|  ❌  | POST | /densify/geometry    | object | add more points in linestring |
|  ❌  | GET  | /within/:lon/:lat    | object | check what dataset contains lon,lat |
|  ❌  | POST | /within/geometry     | object | check what dataset contains geometry in body |
|  ❌  | POST | /meta/geometry       | object | return direction and length of geometry |

**Additional global Parameters:**

|Status|Parameter | Default  | Description |
|------|----------|----------|-------------|
|  🚧  | precision| 7        | rounded to digits decimal precision |
|  🚧  | densify  | false    | enable densification of points in the result |
|  🚧  | simplify | false    | enable simplication geometry of the result |
|  ❌  | format   | by input | output type(json,polyline,geojson) |
|  ❌  | meta     | false    | additional metadata in output |

# Usage

Running by official [Docker image](https://hub.docker.com/r/stefcud/geopicker):

```bash
docker run -v "/$(pwd)/tests/data:/data" -e DEMO_PAGE=true -p 8080:8080 stefcud/geopicker
```

Running from source code in development mode, requirements: _nodejs 16.x_ > and _glibc 2.28_ (_Ubuntu 20.x_ > ):

```bash
npm install
cd server && npm install && cd -
npm run dev
```

## Configuration

Full configuration options can be found in [docs config](./docs/config.md)

## Scripts

some useful tools for contributors `npm run <scriptname>`

- `docker-up` run in local docker-compose container
- `start` run in production mode
- `bench` run benchmarks
- `dev` run in development mode


## Examples requests

**Pick single location data via Get**

```bash
$ curl "http://localhost:9090/elevation/11.123/46.123"

[195]
```

**Stringified locations**

```bash
curl "http://localhost:9090/elevation/11.1,46.1|11.2,46.2|11.3,46.3"

[195,1149,1051]
```

**Geojson geometry**

```bash
$ curl -X POST -H 'Content-Type: application/json' \
  -d '{"type":"LineString","coordinates":[[11.1,46.1],[11.2,46.2],[11.3,46.3]]}' \
  "http://localhost:9090/elevation/geometry"

{"type":"LineString","coordinates":[[11.1,46.1,195],[11.2,46.2,1149],[11.3,46.3,1051]]}
```
## Benchmarks

benchmarks scripts: `tests/benchmarks.js` using [AutoCannon](https://github.com/mcollina/autocannon)

```bash
cd tests && npm install && cd -
npm run bench
```

The results testing a dataset of 10KB [geotiff](https://github.com/opengeo-tech/geopicker/blob/master/tests/data/test_4611_dem.tif)
```
┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬──────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max  │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼──────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 1 ms │ 0.02 ms │ 0.16 ms │ 6 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴──────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Req/Sec   │ 18111   │ 18111   │ 22783   │ 23471   │ 22175.28 │ 1473.21 │ 18099   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Bytes/Sec │ 4.02 MB │ 4.02 MB │ 5.05 MB │ 5.21 MB │ 4.92 MB  │ 327 kB  │ 4.01 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

244k requests in 11.01s, 54.1 MB read
```

# Roadmap

for details see the descriptions in the [Roadmap issues](https://github.com/opengeo-tech/geopicker/labels/Roadmap)

|Status| Goal        |
|------|-------------|
|  🚧  | manage multiple datasets |
|  🚧  | ES6 modules |
|  🚧  | extend benchmarks for any endpoints |
|  ❌  | enable densify function |
|  ❌  | enable simply function |
|  ❌  | unit testing |
|  ❌  | swagger |
|  ❌  | support vector format in datasets, such as shapefile  |
|  ❌  | supports complex geometries in input |
|  ❌  | limit access by api key |
|  ❌  | caching responses |
|  ❌  | websocket interface |
|  ❌  | command line interface |
