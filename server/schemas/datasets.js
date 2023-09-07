
module.exports = (S, fastify) => {

  const {params} = require('./params')(S, fastify)

  // eslint-disable-next-line
  const dataset = S.object()
        .prop('id', S.string())
        .prop('isDefault', S.boolean())
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
    dataset,
    datasetGet: {
      description: 'Describe single dataset',
      params,
      response: {
        200: dataset
      }
    },
    datasetsList: {
      description: 'Describe all datasets available',
      response: {
        200: S.array().items(dataset)
        /*200: S.object() //object version
            .patternProperties({
                '.*': dataset
            })*/
      }
    }
  }
}