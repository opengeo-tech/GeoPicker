/**
 * manager densify parameter and densify coordinates in input
 */
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {utils: {densifyLocations}} = gpicker;

  fastify.addHook('preHandler', (req, res, done) => {

    const {densify = config.densify} = req.query

    if (densify !== false && densify !== 'input') {

      fastify.log.debug(`Set Densify ${densify} ${req.url}`);

      densifyLocations(req.data, densify);

    }
    done()
  })

});