
module.exports = (S, config) => {

  const dataset = S.object()
        .prop('type', S.string().enum(['raster','vector']))
        .prop('band', S.integer())
        .prop('size', S.integer())
        .prop('epsg', S.integer())
        .prop('width', S.integer())
        .prop('height', S.integer())
        .prop('bbox', S.object()
          .prop('minLon', S.number())
          .prop('minLat', S.number())
          .prop('maxLon', S.number())
          .prop('maxLat', S.number())
        );

  return {
    dataset: {
      description: 'Describe single dataset',
      params: S.object().prop('dataset', S.string().enum(Object.keys(config.datasets))).required(),
      response: {
        200: dataset
      }
    },
    datasets: {
      description: 'Describe all datasets available',
      response: {
        200: S.object()
            .patternProperties({
                '.*': dataset
            })
      }
    }
  }
}