
module.exports = (S, fastify) => {

  const Metadata = S.object()
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
    metadata: {
      description: 'Metadata info about geometry',
      //body: Geometry,
      response: {
        200: Metadata
      }
    }
  }
}