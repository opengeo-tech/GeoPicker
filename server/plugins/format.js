/**
 * manager format parameter and the output conversions defined in ../formats/ folder
 */
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config} = fastify
      , {formats} = config
      , {polyline, gpx, geojson} = require('../formats')(fastify);

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
          //TODO array, json
          case 'polyline':
            payloadOut = polyline.write(payload, req)
            res.type(polyline.mimeType);
          break;
          case 'gpx':
            payloadOut = gpx.write(payload, req)
            res.type(gpx.mimeType);
          break;
          case 'geojson':
            payloadOut = geojson.write(payload, req)
            res.type(geojson.mimeType);
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
