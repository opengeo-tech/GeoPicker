
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config} = fastify;

  fastify.decorate('schemas', require('../schemas')(config));
})