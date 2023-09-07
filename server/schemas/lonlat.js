
module.exports = (S, fastify) => {

  const {query} = require('./query')(S, fastify)
      , {params} = require('./params')(S, fastify);

  // eslint-disable-next-line
  const lonlat = S.object()
        .prop('lon', S.number().minimum(-180).maximum(180)).required()
        .prop('lat', S.number().minimum(-90).maximum(90)).required()

  const lonlatVal = S.object()
          .prop('val', S.number())  //TODO change number to any
          .extend(lonlat)

  return {
    lonlat,
    lonlatVal,
    lonlatGet: {
      description: 'Get single value by longitude and latitude',
      params: lonlat.extend(params),
      query,
      response: {
        200: S.array().items(S.integer())
      }
    },
    lonlatPost: {
      description: 'Post single array or object location in body',
      params,
      query,
      body: lonlat,
      response: {
        200: lonlatVal
      }
    }
  }
}