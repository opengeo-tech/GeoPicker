
const fp = require('fastify-plugin')
    , polyline = require('@mapbox/polyline');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {utils: {setPrecision}} = gpicker
      , {output_precision_digits, errors} = config;

  fastify.addHook('onSend', (req, res, payload, done) => {
    let err = null
    const {precision} = req.query

    //TODO filter only some request

    let payloadOut = payload;

    if (precision) {
      setPrecision(payload, precision);
    }
    done(err, payloadOut)
  })
});