
module.exports = (S, config) => {

  return {
    lonlat: {
      description: 'Get single value by longitude and latitude',
      params: S.object()
        .prop('dataset', S.string().enum(Object.keys(config.datasets))).required()
        .prop('lon', S.number().minimum(-180).maximum(180)).required()
        .prop('lat', S.number().minimum(-90).maximum(90)).required()
    },
    lonlatPost: {
      description: 'Get single array location in Post body',
      params: S.object()
        .prop('dataset', S.string().enum(Object.keys(config.datasets))).required()
      // TODO body
    }
  }
}