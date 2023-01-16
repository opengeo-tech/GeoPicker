
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

  fastify.decorate('valid', {
    locations
  });
})