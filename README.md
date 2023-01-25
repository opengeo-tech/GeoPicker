GeoPicker
==========

![geopicker](docs/logo.png)

Geospatial dataset picker via fast http rest interface written in NodeJs bindings for GDAL and [Fastify](https://www.fastify.io/)

# API Rest endpoints

it's work in progress...
https://gist.github.com/stefanocudini/77f36db813997e057d3fd163cbe04a73

|Status|Method| Path                 |Params | Return | Description |
|------|------|----------------------|-------|--------|-------------|
|  ✔️  | GET  | /                    |       | object | service status, versions, datasets |
|  ✔️  | GET  | /datasets            |       | object | list available datasets and their attributes |
|  ✔️  | GET  | /:dataset            |       | object | show attributes of a certain dataset |
|      |      |                      |       |        |             |
|  ✔️  | GET  | /:dataset/:lon/:lat  |       | array  | get single location value of dataset, densify not supported|
|  ✔️  | GET  | /:dataset/:locations |       | array  | locations is a string (format is `lon,lat|lon,lat|lon,lat`), densify not supported |
|      |      |                      |       |        |             |
|  ✔️  | POST | /:dataset/lonlat     |       | arrays | accept array or object in body |
|  ✔️  | POST | /:dataset/geometry   | f,d,p | object | geojson geometry Point or LineString in body
|  ✔️  | POST | /:dataset/locations  | f,d,p | arrays | accept array or object of locations in body (format is `[[lon,lat],[lon,lat],[lon,lat]]`) |
|      |      |                      |       |        |             |
|  ❌  | GET  | /densify/:locations  |       | arrays | add more points in list of locations |
|  ❌  | POST | /densify/geometry    |       | object | add more points in linestring |
|  ❌  | GET  | /within/:lon/:lat    |       | object | check what dataset contains lon,lat |
|  ❌  | POST | /within/geometry     |       | object | check what dataset contains geometry in body |
|  ❌  | POST | /meta/geometry       |       | object | return direction and length of geometry |

Params:
- f format(json,polyline,geojson)
- d densify
- p band/property of dataset

# Usage

Running by official Docker image:

```bash
docker run -v "/$(pwd)/tests/data:/data" -e DEMO_PAGE=true -p 8080:8080 stefcud/geopicker
```

Running from source code in development mode, requirements: nodejs 16.x > and glibc 2.28 (Ubuntu 20.x > ):

```bash
npm install
cd server && npm install
cd -
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
  -d '{"type":"LineString","coordinates":[[11,46],[11.1,46.1],[11.2,46.2]]}' \
  "http://localhost:9090/elevation/geometry"

{"type":"LineString","coordinates":[[11,46,930],[11.1,46.1,195],[11.2,46.2,1149]]}
```
## Benchmarks

benchmarks scripts: `tests/benchmarks.js` using [AutoCannon](https://github.com/mcollina/autocannon)

```bash
npm run bench
```

The results by testing dataset a 10KB [geotiff](https://github.com/opengeo-tech/geopicker/blob/master/tests/data/test_4611_dem.tif)
```
┌─────────┬──────┬──────┬───────┬──────┬────────┬─────────┬───────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg    │ Stdev   │ Max   │
├─────────┼──────┼──────┼───────┼──────┼────────┼─────────┼───────┤
│ Latency │ 0 ms │ 0 ms │ 2 ms  │ 3 ms │ 0.3 ms │ 0.67 ms │ 15 ms │
└─────────┴──────┴──────┴───────┴──────┴────────┴─────────┴───────┘
┌───────────┬─────────┬─────────┬─────────┬────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%  │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 7307    │ 7307    │ 12007   │ 13095  │ 11307.6 │ 2075.54 │ 7305    │
├───────────┼─────────┼─────────┼─────────┼────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 1.62 MB │ 1.62 MB │ 2.66 MB │ 2.9 MB │ 2.51 MB │ 460 kB  │ 1.62 MB │
└───────────┴─────────┴─────────┴─────────┴────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 5
57k requests in 5.01s, 12.5 MB read
```

# Roadmap

for details see the descriptions in the [issues](https://github.com/opengeo-tech/geopicker/labels/Roadmap)

|Status| Goal |
|------|-------------|
|  ❌  | support vector format in datasets, such as shapefile  |
|  ❌  | supports complex geometries in input 
|  ❌  | limit access by api key |
|  ❌  | caching responses ||
|  ❌  | websocket interface |
