
const {resolve} = require('path');

module.exports = async fastify => {

  const {config, schemas, status, gpicker, package} = fastify
      , {version, homepage} = package
      , {attribution, swagger} = config
      , documentation = swagger.enabled ? resolve(swagger.routePrefix) : homepage;

  fastify.get('/status', {schema: schemas.status}, async () => ({
    name: 'GeoPicker',
    version,
    gdal: gpicker.gdal.version,
    documentation,
    attribution,
    status
  }));
}