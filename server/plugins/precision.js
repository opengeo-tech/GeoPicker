
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {utils: {setPrecision}} = gpicker;

  fastify.addHook('preHandler', (req, res, done) => {

    const {precision = config.precision} = req.query

    if (precision !== 'input') {

      fastify.log.debug(`Set Precision ${precision} ${req.url}`);

      setPrecision(req.data, precision);

    }
    done()
  })

});