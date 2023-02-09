
const {resolve} = require('path');

module.exports = async fastify => {

  const {config, status, gpicker, package} = fastify
      , {version, homepage} = package
      , {attribution, swagger} = config

  const documentation = swagger.enabled ? resolve(swagger.routePrefix) : homepage;

  fastify.get('/status', async () => ({
    name: 'GeoPicker',
    version,
    gdal: gpicker.gdal.version,
    documentation,
    attribution,
    status
  }));
}