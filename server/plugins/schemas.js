
const fp = require('fastify-plugin')
    , schemas = require('../schemas');

module.exports = fp(async fastify => {

  const {config} = fastify;

  fastify.decorate('schemas', schemas(config));
})