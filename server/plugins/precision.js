/**
 * manager precision parameter and apply conversions
 */
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, utils: {setPrecision}} = fastify;

  fastify.addHook('preHandler', (req, res, done) => {

    const {precision = config.precision} = req.query

    if (precision !== false && precision !== 'input') {

      fastify.log.debug(`Set precision ${precision} ${req.url}`);

      setPrecision(req.data, precision);

    }
    done()
  })

});