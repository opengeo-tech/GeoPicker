
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {output_precision_digits} = config;

  fastify.addHook('preHandler', (req, res, done) => {

    const {precision = output_precision_digits} = req.query

    if (typeof precision === 'number') {
      req.precision = precision
      console.log('SET PRECESION', precision)
    }
    done()
  })
});