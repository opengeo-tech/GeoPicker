/**
 * manage, dis/enable input validation by configuration
 * and expose some values validations
 */
const fp = require('fastify-plugin')
  , Ajv = require('ajv')
  , ajv = new Ajv({ allErrors: true })

module.exports = fp(async fastify => {

  const {config, schemas} = fastify
      , {validation} = config
      , {lonlatArray, locationsArray, locationsString} = schemas;

  if (!validation) {
    fastify.setValidatorCompiler(() => {
      return data => {
        //always valid
        return true
      }
    });
  }

  function arrayNumbers(nums) {
    return (typeof nums[0] === 'number' && typeof nums[1] === 'number')
  }

  function arrayLonlat(lonlat) {
    return ajv.compile(lonlatArray.valueOf())(lonlat);
  }

  /**
   * valid values of array of array of coordinates
   */
  function arrayLocs(locs) {
    return ajv.compile(locationsArray.valueOf())(locs);
  }

  /**
   * valid serialized location "lon1,lat1|lon2,lat2|..."
   */
  function stringLocs(str) {
    return ajv.compile(locationsString.valueOf())(str)
  }

  fastify.decorate('validate', {
    //TODO geometry
    arrayNumbers,
    arrayLonlat,
    stringLocs,
    arrayLocs,
  });
})