GeoPicker
==========

![geopicker](docs/logo.png)

Geospatial data picker via fast http rest interface

written in Nodejs GDAL and Fastify

* [Demo](https://opengeo.tech/geopicker/)

# API Rest endpoints

it's work in progress...
https://gist.github.com/stefanocudini/77f36db813997e057d3fd163cbe04a73

|status|method| path                 | description  |
|------|------|----------------------|--------------|
|  ✔️  | GET  | /                    | service status, versions, datasets |
|  ✔️  | GET  | /datasets            | list available datasets and their attributes |
|      |      |                      | |
|  ✔️  | GET  | /:dataset/:lon/:lat  | get single location value of dataset |
|  ✔️  | GET  | /:dataset/:locations | accept array of array of coordinates (locations format is `lon,lat|lon,lat|lon,lat`) |
|  ✔️  | POST | /:dataset/geometry   | geojson geometry Point or LineString |
|      |      |                      | |
|  ❌  | GET  | /densify/:locations  | add more points in list of locations |
|  ❌  | POST | /densify/geometry    | add more points in linestring |
|  ❌  | GET  | /within/:lon/:lat    | check what dataset contains lon,lat |
|  ❌  | POST | /within/geometry     | check what dataset contains geometry in body |
|  ❌  | POST | /meta/geometry       | return direction and length of geometry |


**pick data via http:**
```
$ curl "http://localhost:9090/elevation/11.123/46.123
```

**multiple coordinates at same time**
```
$ curl -X POST -H 'Content-Type: application/json'
   -d '{"type":"LineString","coordinaes":[...]}' "http://localhost:9090/elevation/geometry"
```

# Source

* [Github](https://github.com/opengeo-tech/geopicker)
