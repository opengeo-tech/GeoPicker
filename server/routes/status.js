
const {resolve} = require('path');

module.exports = async fastify => {

  const {config, /*schemas,*/ status, gpicker, package} = fastify
      , {version, homepage} = package
      , {fastifyConf, attribution, swagger, compress, cors, demo_page, demo_path} = config
      , {maxParamLength} = fastifyConf
      , crossorigin = cors.enabled ? cors.origin : false
      , compression = compress.enabled ? compress.encodings : false
      , demopage = demo_page ? demo_path : false
      , documentation = swagger.enabled ? resolve(swagger.routePrefix) : homepage
      , {input_max_locations, output_precision_digits} = config

  fastify.get('/status', /*{schema: schemas.status},*/ async () => ({
    status,
    name: 'GeoPicker',
    version,
    gdal: gpicker.gdal.version,
    documentation,
    attribution,
    config: {
      crossorigin,
      compression,
      demopage,
      input_max_locations,
      output_precision_digits,
      maxParamLength
    }
  }));
}