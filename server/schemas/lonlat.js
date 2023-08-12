
module.exports = (S, config) => {

  const {query} = require('./query')(S, config)
      , datasetNames = Object.keys(config.datasets);

  return {
    lonlat: {
      description: 'Get single value by longitude and latitude',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('lon', S.number().minimum(-180).maximum(180)).required()
        .prop('lat', S.number().minimum(-90).maximum(90)).required(),
      query,
      response: {
        200: S.array().items(S.integer())
      }
    },
    lonlatPost: {
      description: 'Post single array or object location in body',
      params: S.object().prop('dataset', S.string().enum(datasetNames)).required(),
      query,
      body: S.object()
        .prop('lon', S.number().minimum(-180).maximum(180)).required()
        .prop('lat', S.number().minimum(-90).maximum(90)).required(),
      response: {
        200: S.object()
          .prop('lon', S.number().minimum(-180).maximum(180)).required()
          .prop('lat', S.number().minimum(-90).maximum(90)).required()
          .prop('val', S.integer())
      }
    }
  }
}