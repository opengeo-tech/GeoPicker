
const {resolve} = require('path');

module.exports = async fastify => {

  const {config, status, gpicker, package, schemas, datasetsIds} = fastify
      , {utils: {humanSize} } = gpicker
      , {version, homepage} = package
      , {fastifyConf, attribution, swagger, compress, cors, demopage, formats} = config
      , {validation, maxLocations, precision} = config
      , {maxParamLength, bodyLimit} = fastifyConf || {}
      , gdal = gpicker.gdal.version
      , datasets = datasetsIds
      , crossorigin = cors.enabled ? cors.origin : false
      , compression = compress.enabled ? compress.encodings : false
      , frontend = demopage ? demopage.path : false
      , documentation = swagger.enabled ? resolve(swagger.routePrefix) : homepage;

  // eslint-disable-next-line
  const out = {
    status,
    name: 'GeoPicker',
    version,
    gdal,
    attribution,
    documentation,
    frontend
  };

  if (config.status?.config) {
    out.config = {
      precision,
      validation,
      maxLocations,
      maxParamLength,
      bodyLimit,
      datasets,
      formats,
      crossorigin,
      compression
    }
  }

  if (config.status?.stats) {
    //https://github.com/fastify/fastify/issues/517#issuecomment-349958775
    //TODO https://github.com/fastify/under-pressure
    out.stats = {
      memory: humanSize(process.memoryUsage().rss)
    }
  }

  fastify.get('/status', {schema: schemas.status}, async () => out);
}