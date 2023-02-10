
module.exports = (S, config) => {

  const status = S.object()
        .prop('name', S.string().const('GeoPicker'))
        .prop('version', S.string().pattern(/^\d{1}\.\d{1}\.\d{1}/))
        .prop('gdal', S.string().pattern(/^\d{1}\.\d{1}\.\d{1}/))
        .prop('documentation', S.string())
        .prop('attribution', S.string())
        .prop('status', S.string())

  return {
    status: {
      description: 'Service status and versions',
      response: {
        200: status
      }
    }
  }
}