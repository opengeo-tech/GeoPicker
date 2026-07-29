
module.exports = fastify => ({
    //TODO array, json, wkt
  ...require('./gpx')(fastify),
  ...require('./geojson')(fastify),
  ...require('./polyline')(fastify),
});
