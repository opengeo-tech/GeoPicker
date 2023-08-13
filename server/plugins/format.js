
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config} = fastify
      , {formats} = config
      , {polylineWrite, gpxWrite} = require('../formats')(fastify);

  if (formats && formats.length > 0) {

    //TODO optimizazion is to move in preSerialization
    fastify.addHook('onSend', (req, res, payload, done) => { //payload is object
      const {format} = req.query
      let payloadOut = payload;
      if (format) {
        fastify.log.debug(`Format conversion in ${format}...`);
        switch(format) {
          case 'polyline':
            payloadOut = polylineWrite(payload, req)
            res.type('text/plain');
          break;
          case 'gpx':
            payloadOut = gpxWrite(payload, req)
            //res.type('application/gpx+xml');
            res.type('text/plain');
          break;
          case 'input':
          default:
            payloadOut = payload;
        }
      }
      done(null, payloadOut)
    });
  }
});