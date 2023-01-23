GeoPicker
==========

![geopicker](docs/logo.png)

Geospatial dataset picker via fast http rest interface written in Nodejs GDAL and Fastify

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

running the official docker image:

```bash
docker run -v "/$(pwd)/tests/data:/data" -e DEMO_PAGE=true -p 8080:8080 stefcud/geopicker
```

Run from source code in development mode, requirements: nodejs 16.x > and glibc 2.28 (Ubuntu 20.x > ):

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

### Pick single location data via Get

```bash
$ curl "http://localhost:9090/elevation/11.123/46.123"

[195]
```

### Stringified locations

```bash
curl "http://localhost:9090/elevation/11.1,46.1|11.2,46.2|11.3,46.3"

[195,1149,1051]
```

### Geojson geometry

```bash
$ curl -X POST -H 'Content-Type: application/json' \
  -d '{"type":"LineString","coordinates":[[11,46],[11.1,46.1],[11.2,46.2]]}' \
  "http://localhost:9090/elevation/geometry"

{"type":"LineString","coordinates":[[11,46,930],[11.1,46.1,195],[11.2,46.2,1149]]}
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
