GeoTiff Picker
==========

Fiule raster *GeoTiff* data picker

with API Restful/CLI interface

# Demo

* [Demo](demo.html)

# Requirements

* http://webpy.org (started by [Aaron Swartz](http://www.aaronsw.com/))
* http://trac.osgeo.org/gdal/wiki/GdalOgrInPython

# Setup

```sudo apt-get install python-webpy python-gdal```

copy GeoTiff files in directory **./tiffs/**

# Usage

**run web interface:**
```
$ ./python-geotiff-picker.py 80

```

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

* [Github](https://github.com/stefanocudini/geotiff-picker)
