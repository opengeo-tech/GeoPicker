
const fp = require('fastify-plugin')
    , S = require('fluent-json-schema');

module.exports = fp(async fastify => {
  fastify.decorate('schemas', {
    ...require('../schemas/datasets')(S, fastify),
    ...require('../schemas/locations')(S, fastify),
    ...require('../schemas/geometry')(S, fastify),
    ...require('../schemas/lonlat')(S, fastify),
    ...require('../schemas/params')(S, fastify),
    ...require('../schemas/query')(S, fastify),
  });
})
