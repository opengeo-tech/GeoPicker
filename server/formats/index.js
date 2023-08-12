
module.exports = fastify => ({
  ...require('./gpx')(fastify),
  ...require('./polyline')(fastify),
});
