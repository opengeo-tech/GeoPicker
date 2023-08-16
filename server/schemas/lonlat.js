
module.exports = (S, fastify) => {

  const {query} = require('./query')(S, fastify)
      , {params} = require('./params')(S, fastify);

  // eslint-disable-next-line
  const Lonlat = params
        .prop('lon', S.number().minimum(-180).maximum(180)).required()
        .prop('lat', S.number().minimum(-90).maximum(90)).required()

  return {
    lonlatGet: {
      description: 'Get single value by longitude and latitude',
      params: Lonlat,
      query,
      response: {
        200: S.array().items(S.integer())
      }
    },
    lonlatPost: {
      description: 'Post single array or object location in body',
      params,
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