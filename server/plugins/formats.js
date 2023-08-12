
const fp = require('fastify-plugin')
    , polyline = require('@mapbox/polyline');

module.exports = fp(async fastify => {

  const {config} = fastify
      , {formats, errors} = config;

  //fastify.addHook('onRequest', fastify.authenticate)

  if (formats && formats.length > 0) {
    fastify.addHook('onSend', (req, res, payload, done) => {
      let err = null
      const {format} = req.query

      //TODO filter only some request

      let payloadOut = payload;

      if (format) {
        if (formats.includes(format)) {
          switch(format) {
            case 'polyline':
              fastify.log.debug(`onSend ${format}`);
              payloadOut = polyline.encode(payload)
            break;
         /* case 'gpx':
            break;*/
            case 'input':
            default:
              payloadOut = payload;
          }
        }
        else {
          err = new Error(errors.noformat)
        }
      }
      done(err, payloadOut)
    })
  }
});