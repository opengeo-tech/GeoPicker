
module.exports = (S, fastify) => {

  const {params} = require('./params')(S, fastify)
      , {lonlat} = require('./lonlat')(S, fastify);

  // eslint-disable-next-line
  const dataset = S.object()
        .prop('id', S.string())
        .prop('isDefault', S.boolean())
        .prop('type', S.string().enum(['raster','vector']))
        .prop('band', S.integer())
        .prop('fileSize', S.integer())
        .prop('epsg', S.integer())
        .prop('width', S.integer())
        .prop('height', S.integer())
        .prop('unit', S.string())
        .prop('dataType', S.string())
        .prop('noData', S.number())
        .prop('pixelSize', S.object()
          .prop('x', S.number())
          .prop('y', S.number())
        )
        .prop('bbox', S.object()
          .prop('minLon', S.number())
          .prop('minLat', S.number())
          .prop('maxLon', S.number())
          .prop('maxLat', S.number())
        );

  const datasets = S.array().items(dataset);

  return {
    dataset,
    datasetGet: {
      description: 'Describe single dataset by id',
      params,
      response: {
        200: dataset
      }
    },
    datasetsLonlat: {
      description: 'Search datasets contains lon,lat',
      params: lonlat,
      response: {
        200: datasets
      }
    },
    datasetsList: {
      description: 'Describe all datasets available',
      response: {
        200: datasets
      }
    }
  }
}