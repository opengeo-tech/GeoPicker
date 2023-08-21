
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {utils: {setPrecision}} = gpicker
      , {output_precision_digits} = config;

  fastify.addHook('preHandler', (req, res, done) => {

    const {precision = output_precision_digits} = req.query

    if (precision !== 'input') {

      fastify.log.debug(`Set Precision ${precision} ${req.url}`);

      setPrecision(req.data, precision);
    }
    done()
  })

});