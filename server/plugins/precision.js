
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {utils: {setPrecision}} = gpicker
      , {output_precision_digits} = config;

  fastify.addHook('preSerialization', (req, res, payload, done) => {
    const {precision = output_precision_digits} = req.query

    if (typeof precision === 'number') {
      setPrecision(payload, precision);
    }
    done(null, payload)
  })
});