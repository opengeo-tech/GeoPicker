
module.exports = (S, fastify) => {

  const {config: {maxLocations}} = fastify
      , {query} = require('./query')(S, fastify)
      , {params} = require('./params')(S, fastify);

  // eslint-disable-next-line
  const Geometry = S.object()
    .oneOf([
        S.object()
        .prop('type', S.string().const('LineString')).required()
        .prop('coordinates', S.array().minItems(2).maxItems(maxLocations).items(
          S.array().minItems(2).items(S.number())
        )).required()
        ,
        S.object()
        .prop('type', S.string().const('Point')).required()
        .prop('coordinates',
          S.array().minItems(2).items(S.number())
        ).required()
    ]);

  return {
    geometry: {
      description: 'JSON as geojson geometry',
      params,
      query,
      body: Geometry,
      response: {
        200: Geometry
      }
    }
  }
}