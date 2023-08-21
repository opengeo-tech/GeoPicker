
const {resolve} = require('path');

module.exports = async fastify => {

  const {config, status, gpicker, package, schemas, datasetsNames} = fastify
      , {utils: {humanSize} } = gpicker
      , {version, homepage} = package
      , {fastifyConf, attribution, swagger, compress, cors, demopage, formats} = config
      , {validation, maxLocations, output_precision_digits} = config
      , {maxParamLength, bodyLimit} = fastifyConf
      , gdal = gpicker.gdal.version
      , datasets = datasetsNames
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
      validation,
      maxLocations,
      output_precision_digits,
      maxParamLength,
      bodyLimit,
      crossorigin,
      datasets,
      compression,
      formats
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