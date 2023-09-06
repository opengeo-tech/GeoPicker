/**
 * manager simplify parameter and simplify coordinates in input
 */
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {utils: {simplifyLocations}} = gpicker;

  fastify.addHook('preHandler', (req, res, done) => {

    const {simplify = config.simplify} = req.query

    if (simplify !== false && simplify !== 'input') {

      fastify.log.debug(`Set simplify factor ${simplify} ${req.url}`);

      req.data = simplifyLocations(req.data, simplify);
    }

    done()
  })

});