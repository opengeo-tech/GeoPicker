
module.exports = (S, config) => {

  const datasetNames = Object.keys(config.datasets);

  const geojson = S.object()
    .oneOf([
        S.object()
        .prop('type', S.string().const('Point')).required()
        .prop('coordinates', S.array().maxItems(2).items(S.number())).required()
      ,
        S.object()
        .prop('type', S.string().const('LineString')).required()
        .prop('coordinates', S.array().minItems(2).maxItems(config.input_max_locations).items(
          S.array().maxItems(2).items(S.number())
        )).required()
    ]);

  return {
    geometry: {
      description: 'Post a geojson geometry',
      params: S.object().prop('dataset', S.string().enum(datasetNames)).required(),
      body: geojson
      /* TODO response: {
        200: S.object().prop('created', S.boolean())
      } */
    }
  }
}