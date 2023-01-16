
const fp = require('fastify-plugin')
  , S = require('fluent-json-schema')
  , Ajv = require('ajv')

module.exports = fp(async fastify => {

  const {config} = fastify

  function locations(locs) {
    const ajv = new Ajv({ allErrors: true })
      , schema = S.array().minItems(2).maxItems(config.max_locations).items(
                  S.array().minItems(2).maxItems(2).items(S.number())
                )
      , jschema = schema.valueOf()

    return ajv.compile(jschema)(locs);
  }

  fastify.decorate('valid', {
    locations
  });
})