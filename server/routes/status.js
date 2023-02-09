
module.exports = async fastify => {

  const {config, status, gpicker, package} = fastify
      , {version} = package
      , {attribution} = config

  fastify.get('/status', async () => ({
    name: 'GeoPicker',
    version,
    gdal: gpicker.gdal.version,
    attribution,
    status
  }));
}