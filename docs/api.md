# API Rest endpoints

it's work in progress...

|method| path                 | description  |
|------|----------------------|--------------|
| GET  | /                    | service status, versions, datasets |
| GET  | /datasets            |
| GET  | /:dataset/meta       | |
| GET  | /:dataset/:lon/:lat  | |
| GET  | /:dataset/:locations | array of array of coordinates (locations format is `lon,lat|lon,lat|lon,lat`) |
| POST | /:dataset/geometry   | geojson geometry Point or LineString |
|      |                      | |
| GET  | /densify/:locations  | |
| POST | /densify/geometry    | add more points in linestring |
| GET  | /within/:lon/:lat    | check what dataset contains lon,lat |
| POST | /within/geometry     | check what dataset contains geometry in body |
| POST | /meta/geometry       | return direction and length of geometry |
