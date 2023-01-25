
const _ = require('lodash')
const http = require('http')
const autocannon = require('autocannon')

/**
 * pick a random location inside a certain bounding box
 */
function locRandom(bbox) {
  var world = [[-90, -180], [90, 180]];
  bbox = bbox || world;
  var sw = bbox[0],
    ne = bbox[1],
    lngs = ne[1] - sw[1],
    lats = ne[0] - sw[0];

  const lon = sw[1] + lngs * Math.random()
      , lat = sw[0] + lats * Math.random()

  return [lon, lat];
}

http.request({
  hostname: 'localhost',
  method: 'GET',
  port: 9090,
  path: '/test'
}, res => {
    var str = "";
    res.on('data', chunk => {
        str += chunk;
    });
    res.on('end', () => {
      const json = JSON.parse(str)
          , {bbox} = json
          , {minLon,minLat,maxLon,maxLat} = bbox
          , bb = [[minLat,minLon],[maxLat,maxLon]];

      const url = 'http://localhost:9090/test'

      let r = 0;
      autocannon({
        url,
        duration: 5,  //The number of seconds to run the autocannon. default: 10.
        pipelining: 1,  //The number of pipelined requests to use. default: 1.
        connections: 10,  //The number of concurrent connections to use. default: 10.
        requests: [{
          setupRequest: function(request) {

            const [lon, lat] = locRandom(bb)

            request.path = `${url}/${lon}/${lat}`;

            return request
          }
        }]
      }, (err,ress) => {

        const out = autocannon.printResult(ress, {})

        console.log(out)
      })



    });
})
.end();


