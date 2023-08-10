
const {resolve} = require('path');

module.exports = async fastify => {

  const {config, status, gpicker, package} = fastify
      , {version, homepage} = package
      , {fastifyConf, attribution, swagger, compress, cors, demopage} = config
      , {input_max_locations, output_precision_digits} = config
      , {maxParamLength, bodyLimit} = fastifyConf
      , gdal = gpicker.gdal.version
      , crossorigin = cors.enabled ? cors.origin : false
      , compression = compress.enabled ? compress.encodings : false
      , frontend = demopage ? demopage.path : false
      , documentation = swagger.enabled ? resolve(swagger.routePrefix) : homepage

  fastify.get('/status', async () => ({
    status,
    name: 'GeoPicker',
    version,
    gdal,
    attribution,
    documentation,
    frontend,
    config: {
      input_max_locations,
      output_precision_digits,
      maxParamLength,
      bodyLimit,
      crossorigin,
      compression,
    }
  }));
}