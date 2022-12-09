GeoPicker
==========


![geopicker](docs/logo.png)

Geospatial data picker via fast http rest interface

written in Nodejs GDAL and Fastify

# Demo

* [Demo](https://opengeo.tech/geopicker/)

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
