
module.exports = (S, fastify) => {

  const {params} = require('./params')(S, fastify)

  // eslint-disable-next-line
  const Dataset = S.object()
        .prop('id', S.string())
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
      params,
      response: {
        200: Dataset
      }
    },
    datasets: {
      description: 'Describe all datasets available',
      response: {
        200: S.array().items(Dataset)
        /*200: S.object() //object version
            .patternProperties({
                '.*': Dataset
            })*/
      }
    }
  }
}