
const fp = require('fastify-plugin')
  , S = require('fluent-json-schema');

module.exports = fp(async fastify => {

  const {config} = fastify;

  fastify.decorate('schemas', require(`${__dirname}/../schemas`)(S, config));
})