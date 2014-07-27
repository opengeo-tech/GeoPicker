Python DEM Picker
==========

*Digital Elevation Model* data picker

with http interface

#Requirements

* http://webpy.org (started by [Aaron Swartz](http://www.aaronsw.com/))
* http://trac.osgeo.org/gdal/wiki/GdalOgrInPython

#Setup

```sudo apt-get install python-webpy python-gdal```

copy GeoTiff files in directory **./demfiles/**

#Usage

**run web interface:**
```
$ ./python-dem-picker.py 80

```

**pick data via http:**
```
$ curl "http://localhost/dem/?lat=42.5&lon=12.5"

```

#Source

* [Github](https://github.com/stefanocudini/python-dem-picker)