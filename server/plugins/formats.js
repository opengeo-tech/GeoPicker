
const fp = require('fastify-plugin')
    , polyline = require('@mapbox/polyline');

module.exports = fp(async fastify => {

  const {config} = fastify
      , {formats, errors} = config;

  //fastify.addHook('onRequest', fastify.authenticate)

  fastify.addHook('onSend', (req, res, payload, done) => {
    let err = null
    const {format} = req.query

    //TODO filter only some request

    let payloadOut = payload;

    if (format) {
      if (formats.includes(format)) {
        switch(format) {
          case 'polyline':
            console.log(payload, 'onSend')
            payloadOut = polyline.encode(payload)
            console.log(payloadOut, 'onSend')
          break;
       /* case 'gpx':
            console.log(req, payload, 'onSend')
          break;*/
          case 'input':
          default:
            console.log('onSend')
        }
      }
      else {
        err = new Error(errors.noformat)
      }
    }
    done(err, payloadOut)
  })
});