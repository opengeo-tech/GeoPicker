
const fp = require('fastify-plugin')
  , S = require('fluent-json-schema')
  , Ajv = require('ajv')
  , ajv = new Ajv({ allErrors: true })

module.exports = fp(async fastify => {

  const {config: {maxLocations}, schemas: {locationsString}} = fastify;

// TODO disable all schemas if input_validation == false
/*  fastify.addHook('preValidation', (req, res, done) => {
    //fastify.addHook('preHandler', (req, res, done) => {
    console.log('PRE VALID ALL', Object.keys(req))
    done()
  });
*/
  function arrayNumbers(nums) {
    return (typeof nums[0] === 'number' && typeof nums[1] === 'number')
  }

  function arrayLonlat(lonlat) {
    const schema = S.array().minItems(2).maxItems(2).items([
          S.number().minimum(-180).maximum(180), //lon
          S.number().minimum(-90).maximum(90) //lat
        ]);

    return ajv.compile(schema.valueOf())(lonlat);
  }

  /**
   * valid serialized location "lon1,lat1|lon2,lat2|..."
   */
  function stringLocs(str) {
    return ajv.compile(locationsString.valueOf())(str)
  }

  /**
   * valid values of array of array of coordinates
   */
  function arrayLocs(locs) {
    const schema = S.array().minItems(2).maxItems(maxLocations).items(
            S.array().minItems(2).maxItems(2).items(S.number())
          )
    return ajv.compile(schema.valueOf())(locs);
  }

  fastify.decorate('valid', {
    //TODO geometry
    arrayNumbers,
    arrayLonlat,
    stringLocs,
    arrayLocs,
  });
})