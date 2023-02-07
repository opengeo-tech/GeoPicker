
module.exports = async fastify => {

  const {config, status, gpicker, package} = fastify
      , {name, version} = package
      , {attribution} = config

  fastify.get('/status', async () => ({
    name,
    version,
    gdal: gpicker.gdal.version,
    attribution,
    status
  }));
}