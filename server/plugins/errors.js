
const fp = require('fastify-plugin');

module.exports = fp(async fastify => {
  fastify.decorate('errors', {
    densify_nobody: "Require a geojson in body",
    nodatadir: "Data directory not exists",
    nodataset: "Dataset name not exists",
    nodatasets: "At least one default dataset is required",
    nodefaultdataset: "Default dataset file not exists",
    noformat: "Request format not supported",
    nolocations: "Require array of locations",
    outofbounds: "Location is out of dataset bounds",
  });
})


