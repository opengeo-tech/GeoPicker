module.exports = (S, fastify) => {

  const {config: {formats, compress:{encodings}}, datasetsIds} = fastify;

  const status = S.object()
        .prop('status')
        .prop('name')
        .prop('version')
        .prop('gdal')
        .prop('attribution')
        .prop('documentation')
        .prop('frontend')
        .prop('config',
          S.object()
          .prop('precision', S.number())
          .prop('validation', S.boolean())
          .prop('maxLocations', S.number())
          .prop('maxParamLength', S.number())
          .prop('bodyLimit', S.number())
          .prop('crossorigin')
          .prop('datasets', S.array().items(S.string().enum(datasetsIds)))
          .prop('formats', S.array().items(S.string().enum(formats)))
          .prop('compression', S.array().items(S.string().enum(encodings)))
        )
        .prop('stats',
          S.object()
          .prop('memory')
        )


  return {
    status: {
      description: 'Service status and configs',
      response: {
        200: status
      }
    }
  }
}