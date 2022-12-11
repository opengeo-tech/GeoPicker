# API Rest endpoints

it's work in progress...
https://gist.github.com/stefanocudini/77f36db813997e057d3fd163cbe04a73

|method| path                 | description  |
|------|----------------------|--------------|
| GET  | /                    | service status, versions, datasets |
| GET  | /datasets            | list available datasets and their attributes |
| GET  | /:dataset/:lon/:lat  | get single location value of dataset |
| GET  | /:dataset/:locations | array of array of coordinates (locations format is `lon,lat|lon,lat|lon,lat`) |
| POST | /:dataset/geometry   | geojson geometry Point or LineString |
|      |                      | |
| GET  | /densify/:locations  | add more points in list of locations |
| POST | /densify/geometry    | add more points in linestring |
| GET  | /within/:lon/:lat    | check what dataset contains lon,lat |
| POST | /within/geometry     | check what dataset contains geometry in body |
| POST | /meta/geometry       | return direction and length of geometry |
