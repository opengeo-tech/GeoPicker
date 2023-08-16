
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config} = fastify
      , {formats} = config
      , {polylineWrite, gpxWrite, geojsonWrite} = require('../formats')(fastify);

  if (formats && formats.length > 0) {

    /*TODO fastify.addHook('preParsing', (request, reply, payload, done) => {
      // TODO convert input format in geojson
      //Notice: in the preParsing hook, request.body will always be undefined,
      //because the body parsing happens before the preValidation hook.
      done(null, newPayload)
    })*/

    //TODO optimizazion is to move in preSerialization(bypass schemas)
    //Response set schema
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
            res.type('application/gpx+xml');
          break;
          case 'geojson':
            payloadOut = geojsonWrite(payload, req)
            res.type('application/geo+json');
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