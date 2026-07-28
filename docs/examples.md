
# Requests Example

For full API documentation, see the [Swagger API Documentation](https://opengeo.tech/geopicker/docs).

The examples below use `http://localhost:9090` (development mode, `npm run dev`); with the Docker container the port is `8080`.

Get single location exchanging a few bytes:
```bash
 $ curl "http://localhost:9090/default/11.123/46.123"

[195]
```

```bash
$ curl "http://localhost:9090/default/11.123/46.123?format=gpx"
```
output is a waypoint in GPX format:

```xml
<gpx version="1.1" creator="Geopicker">
<metadata/>
<wpt lat="46.123" lon="11.123">
<name/>
<desc/>
<ele>400</ele>
</wpt>
</gpx>
```

Post a json object and receive the same decorated with the result(still works with `longitude`,`latitude`):
```bash
$ curl -X POST -d '{"lon": 11.123, "lat": 46.123"}' \
  -H 'Content-Type: application/json' \
  "http://localhost:9090/elevation/lonlat"

{"lon": 11.123,"lat": 46.123,"val":195}
```

Get many stringified locations in one time(designed for not too long LineString):
```bash
curl "http://localhost:9090/elevation/11.1,46.1|11.2,46.2|11.3,46.3"

[195,1149,1051]
```

Post a very long LineString saving bytes:
```bash
$ curl -X POST -d '[[10.9998,46.0064],[10.9998,46.0065],[10.9999,46.0066],[11.0000,46.0067]]' \
  -H 'Content-Type: application/json' \
  "http://localhost:9090/elevation/locations"

[[10.9998,46.0064,900],[10.9998,46.0065,898],[10.9999,46.0066,898],[11.0000,46.0067,900]]
```

Post anyone GeoJSON geometry, the same input geometry is always returned which has a third dimension:
```bash
$ curl -X POST -d '{"type":"LineString","coordinates":[[11.1,46.1],[11.2,46.2],[11.3,46.3]]}' \
  -H 'Content-Type: application/json' \
  "http://localhost:9090/elevation/geometry"

{"type":"LineString","coordinates":[[11.1,46.1,195],[11.2,46.2,1149],[11.3,46.3,1051]]}
```

Post a GeoJSON geometry of 2 points and Densify the linestring adding point each 400 meters,
this will help you build a less angular elevation graph:

```bash
$ curl -X POST -d '{"type":"LineString","coordinates":[[11,46],[11.01,46.01]]}' \
  -H 'Content-Type: application/json' \
  "http://localhost:9090/elevation/geometry?densify=400&precision=5"
```

output contains 3 additional interpolated locations with reduced precision digits:

```json
{
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [
          [11, 46, 897],
          [11.003, 46.003, 968],
          [11.006, 46.006, 1029],
          [11.009, 46.009, 1122],
          [11.01, 46.01, 1187]
        ]
    }
}
```

Get the elevation value between two locations every 100 meters

```bash
curl "http://localhost:9090/elevation/11,46|11.01,46.01?densify=100"

[925,858,909,963,968,1001,1018,997,1025,1062,1064,1102,1115,1163,1187]
```
