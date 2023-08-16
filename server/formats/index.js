
module.exports = fastify => ({
  ...require('./gpx')(fastify),
  ...require('./geojson')(fastify),
  ...require('./polyline')(fastify),
});
