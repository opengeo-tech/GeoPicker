
const {resolve} = require('path');

module.exports = async fastify => {

  const {config, gpicker, package, utils, datasetsIds} = fastify
      , {fastifyConf, attribution, swagger, compress, cors, demopage} = config
      , {validation, maxLocations, precision} = config
      , {maxParamLength, bodyLimit} = fastifyConf || {}
      , gdal = gpicker.gdal.version
      , datasets = datasetsIds
      , crossorigin = cors.enabled ? cors.origin : false
      , compression = compress.enabled ? compress.encodings : false
      , frontend = demopage ? demopage.path : false
      , {version, homepage} = package
      , documentation = swagger.enabled ? resolve(swagger.routePrefix) : homepage;

  const formatsDefs = require('../formats')(fastify);

  const formats = config.formats.reduce((acc, name) => {
    acc[name] = formatsDefs[name]?.mimeType
    return acc;
  }, {});

  // eslint-disable-next-line
  const out = {
    status: fastify.status,
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
      crossorigin,
      compression,
      formats,
      datasets,
    }
  }

  if (config.status?.stats) {
    //https://github.com/fastify/fastify/issues/517#issuecomment-349958775
    //TODO https://github.com/fastify/under-pressure
    out.stats = {
      memory: utils.humanSize(process.memoryUsage().rss)
    }
  }

  fastify.get('/status', async () => out);
}
