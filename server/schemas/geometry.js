
module.exports = (S, config) => {

  const GeoJSON = S.object()
    .oneOf([
        S.object()
        .prop('type', S.string().const('LineString')).required()
        .prop('coordinates', S.array().minItems(2).maxItems(config.input_max_locations).items(
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
      params: S.object().prop('dataset', S.string().enum(Object.keys(config.datasets))).required(),
      body: GeoJSON,
      response: {
        200: GeoJSON
      }
    }
  }
}