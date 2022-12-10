
# API Rest endpoints

it's work in progress...

|method/url  | description |
|---|---|
| GET / | service status, versions, datasets |
| POST /:dataset/ | if raster prop is band, for shape prop is field |
| GET /:dataset/ | |
| GET /pixel/:lat/:lon | |
| GET /:locations | |
| POST /geometry | geojson geometry |
| GET /densify/:locations | |
| POST /densify/geometry | add more points in linestring |
| POST /meta/geometry | return direction and length of geometry |
| GET /within/:lat/:lon | check if lat lon inside the default dataset |
