
module.exports = (S, fastify) => {

  const {params} = require('./params')(S, fastify)
      , {lonlat} = require('./lonlat')(S, fastify);

  // eslint-disable-next-line
  const dataset = S.object()
        .prop('id', S.string())
        .prop('isDefault', S.boolean())
        .prop('type', S.string().enum(['raster','vector']))
        .prop('epsg', S.integer())
        .prop('band', S.integer())
        .prop('dataType', S.string())
        .prop('noDataValue', S.number())
        .prop('stats',
          S.object()
          .prop('min', S.number())
          .prop('max', S.number())
          .prop('mean', S.number())
        )
        .prop('width', S.integer())
        .prop('height', S.integer())
        .prop('pixelSize',
          S.object()
          .prop('unit', S.string())
          .prop('x', S.number())
          .prop('y', S.number())
          //TODO meter
        )
        .prop('centroid',
          S.object()
          .prop('lon', S.number())
          .prop('lat', S.number())
        )
        .prop('bbox',
          S.object()
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