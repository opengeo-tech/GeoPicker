
module.exports = (S, fastify) => {

  const {config: {maxLocations}} = fastify
      , {query} = require('./query')(S, fastify)
      , {params} = require('./params')(S, fastify);

  // eslint-disable-next-line
  const geometry = S.object()
    .oneOf([
        S.object()
        .prop('type', S.string().const('LineString')).required()
        .prop('coordinates',
          S.array().minItems(2).maxItems(maxLocations).items(
            S.array().minItems(2).items(S.number())
          )
        ).required()
        ,
        S.object()
        .prop('type', S.string().const('Point')).required()
        .prop('coordinates',
          S.array().minItems(2).items(S.number())
        ).required()
    ]);

const feature = S.object()
    .prop('type', S.string().const('Feature')).required()
    .prop('properties', S.object())//.required()
    .prop('geometry', geometry).required()

  return {
    geometry,
    geometryPost: {
      description: 'JSON as geojson geometry',
      params,
      query,
      body: S.object().oneOf([feature, geometry]),
      response: {
        200: S.object().oneOf([feature, geometry])
      }
    }
  }
}