
const S = require('fluent-json-schema');

module.exports = async fastify => {

  const {config, defaultDataset, gpicker} = fastify
      , {getValue, setValue} = gpicker
      , datasetNames = Object.keys(config.datasets);

  fastify.get('/:dataset/:lon/:lat', {
    schema: {
      description: 'Get single value by longitude and latitude',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('lon', S.number().minimum(-180).maximum(180)).required()
        .prop('lat', S.number().minimum(-90).maximum(90)).required()
    }
  }, async req => {

    const {/*dataset,*/ lon, lat} = req.params
        // TODO use dataset
        , val = getValue([lon, lat], defaultDataset);

    // TODO return multiple val for multiple datasets

    return [val];
  });


  fastify.post('/:dataset/lonlat', {
    schema: {
      description: 'Get single array location in body',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
      // TODO body
    }
  }, async req => {

    return setValue(req.body, defaultDataset)
  });
}