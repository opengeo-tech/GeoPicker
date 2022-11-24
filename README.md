GeoTiff Picker
==========

File raster *GeoTiff* data picker

with API Restful/CLI interface

# Demo

* [Demo](https://opengeo.tech/maps/geotiff-picker/)

## API endpoints

|method/url  | description |
|---|---|
| GET / | service status, versions, datasets |

| POST /:dataset/:prop/ | if raster prop is band, for shape prop is field |
| GET /:dataset/:prop/ | |

| GET /pixel/:lat/:lon | |
| GET /:locations | |
| POST /geometry | geojson geometry |

| GET /densify/:locations | |
| POST /densify/geometry | add more points in linestring |
| POST /meta/geometry | return direction and length of geometry |
| GET /within/:lat/:lon | checl lat lon inside the default dataset |


**pick data via http:**
```
$ curl "http://localhost/dem/?lat=42.5&lon=12.5"
```

**multiple coordinates at same time**
```
$ curl "http://localhost/dem/?locs=42.5,12.50|42.6,12.250|42.3,12.43|42.13,12.66"
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

* [Github](https://github.com/opengeo-tech/geotiff-picker)
