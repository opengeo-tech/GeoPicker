/**
 * manager densify parameter and densify coordinates in input
 */
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, utils: {densifyLocations}} = fastify;

  fastify.addHook('preHandler', (req, res, done) => {

    const {densify = config.densify} = req.query

    if (densify !== false && densify !== 'input') {

      fastify.log.debug(`Set densify ${densify} meters ${req.url}`);

      req.data = densifyLocations(req.data, densify);
    }

    done()
  })

});