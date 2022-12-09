GeoPicker
==========


![geopicker](docs/logo.png)

Geospatial data picker via fast http rest interface

written in Nodejs GDAL and Fastify

# Demo

* [Demo](https://opengeo.tech/geopicker/)

**pick data via http:**
```
$ curl "http://localhost:9090/pixel/42.1/11.1
```

**multiple coordinates at same time**
```
$ curl "http://localhost:9090/pixel/?locs=42.5,12.50|42.6,12.250|42.3,12.43|42.13,12.66"
```
*return json:*
```
{
	"dem":[
		100.0, 76.0, 99.0, 45.0
	]
}
```

# Source

* [Github](https://github.com/opengeo-tech/geopicker)
