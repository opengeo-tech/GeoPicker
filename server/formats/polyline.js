
const polyline = require('@mapbox/polyline');

module.exports = fastify => {
  const mimeType = 'text/plain';
  return {
    'polyline': {
        mimeType,
        read: raw => {
            return polyline.decode(raw)
        },
        write: (data, req) => {
            //TODO convert in array of array
            return polyline.encode(data)
        }
    }
  }
}
