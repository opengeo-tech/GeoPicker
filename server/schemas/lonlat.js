
module.exports = (S, fastify) => {

  const {query} = require('./query')(S, fastify)
      , {params} = require('./params')(S, fastify);

  const lon = S.number().minimum(-180).maximum(180)
      , lat = S.number().minimum(-90).maximum(90);

  const lonlat = S.object()
        .prop('lon', lon).required()
        .prop('lat', lat).required()

  const lonlatVal = S.object()
        .prop('val', S.number())  //TODO change number to any
        .extend(lonlat)

  const lonlatArray = S.array().minItems(2).maxItems(2).items([lon, lat]);

  return {
    lon,
    lat,
    lonlat,
    lonlatVal,
    lonlatArray,
    lonlatGet: {
      description: 'Get single value by longitude and latitude',
      params: lonlat.extend(params),
      query,
      response: {
        200: S.array().items(S.number()) //single array value
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