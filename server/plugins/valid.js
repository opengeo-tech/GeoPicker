
const fp = require('fastify-plugin')
  , S = require('fluent-json-schema')
  , Ajv = require('ajv')
  , ajv = new Ajv({ allErrors: true })

module.exports = fp(async fastify => {

  const {config} = fastify;

  function locations(locs) {
    const schema = S.array().minItems(2).maxItems(config.input_max_locations).items(
                  S.array().minItems(2).maxItems(2).items(S.number())
                );
    return ajv.compile(schema.valueOf())(locs);
  }

  function lonlat(lonlat) {
    const schema = S.array().minItems(2).maxItems(2).items([
          S.number().minimum(-180).maximum(180), //lon
          S.number().minimum(-90).maximum(90) //lat
        ]);

    return ajv.compile(schema.valueOf())(lonlat);
  }

  function numbers(nums) {
    return (typeof nums[0] === 'number' && typeof nums[1] === 'number')
  }

  fastify.decorate('valid', {
    //TODO geometry
    locations,
    numbers,
    lonlat
  });
})