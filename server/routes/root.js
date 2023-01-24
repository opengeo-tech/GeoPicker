
// const S = require('fluent-json-schema')

module.exports = async fastify => {

  const {config, status, gpicker, package} = fastify
      , {name, version} = package
      , {attribution} = config

  fastify.get('/', async () => ({
    name,
    version,
    gdal: gpicker.gdal.version,
    status,
    attribution
  }));
}