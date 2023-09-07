
module.exports = (S, fastify) => {

  const {locations} = require('./locations')(S, fastify)
      //, {geometry} = require('./geometry')(S, fastify)

  const metadata = S.object()
        .prop('length', S.integer())
        .prop('direction', S.integer())
        .prop('centroid',
          S.array().minItems(2).items(S.number())
        )
        .prop('middlepoint',
          S.array().minItems(2).items(S.number())
        )
        .prop('bbox', S.object()
          .prop('minLon', S.number())
          .prop('minLat', S.number())
          .prop('maxLon', S.number())
          .prop('maxLat', S.number())
        );

  return {
    metadata,
    metadataLocations: {
      description: 'Metadata info about a list of locations',
      params: locations,
      response: {
        200: metadata
      }
    },
    metadataGeometry: {
      description: 'Metadata info about a geojson',
      //TODO body: geometry,
      response: {
        200: metadata
      }
    }
  }
}