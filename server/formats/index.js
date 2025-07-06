
module.exports = fastify => ({
    //TODO array, json
  ...require('./gpx')(fastify),
  ...require('./geojson')(fastify),
  ...require('./polyline')(fastify),
});
