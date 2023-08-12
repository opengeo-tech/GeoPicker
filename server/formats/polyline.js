
const polyline = require('@mapbox/polyline');

module.exports = fastify => {
  return {
    polylineRead: raw => {
      return polyline.decode(raw)
    },
    polylineWrite: data => {
      //TODO convert in array of array
      return polyline.encode(data)
    }
  }
}