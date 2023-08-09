
const fp = require('fastify-plugin')
    , polyline = require('@mapbox/polyline');

module.exports = fp(async fastify => {

  //fastify.addHook('onRequest', fastify.authenticate)

  fastify.addHook('onSend', (req, res, payload, done) => {
    const err = null
    const {format} = req.query
console.clear()
console.log('FOOOOOOOOOOOOOOOORMAT',format)

    let payloadOut = payload;

    if (format) {
      switch(format) {
        case 'polyline':
          console.log(payload, 'onSend')
          payloadOut = polyline.encode(payload)
          console.log(payloadOut, 'onSend')
        break;
/*        case 'gpx':
          console.log(req, payload, 'onSend')
        break;*/
        case 'input':
        default:
          console.log('onSend')
      }
    }
    done(err, payloadOut)
  })
});