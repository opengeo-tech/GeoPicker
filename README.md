python-dem-picker
==========

Digital Elevation Model data picker
Python web interface

#requirements

* http://webpy.org (started by Aaron Swartz)
* http://trac.osgeo.org/gdal/wiki/GdalOgrInPython

```
sudo apt-get install python-gdal
sudo easy_install web.py
```

#usage

**run web interface:**

```
$ ./python-dem-picker.py 8080
```

**pick data via http**
```
$ curl "http://127.0.0.1:9090/dem/?lat=42.5&lon=12.56"
```