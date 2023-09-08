/**
 * set attribute req.data parsing and converting
 * for any type of endpoints
 */
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {sepLocs, sepCoords} = config
      , {utils: {parseLocations}} = gpicker;

  fastify.addHook('preHandler', (req, res, done) => {
    const {params, body} = req
        , {lon, lat, locations} = params;

    //all types of input objects
    if (lon && lat) {
      req.data = [lon, lat];
    }
    else if (typeof locations === 'string') {
      req.data = parseLocations(locations, sepLocs, sepCoords);
    }
    else if (body) {
      req.data = body;
    }

    done();
  })
});