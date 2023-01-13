
const S = require('fluent-json-schema');

module.exports = async fastify => {

  const {config, defaultDataset, gpicker} = fastify
      , {getValue, setValue} = gpicker
      , datasetNames = Object.keys(config.datasets);

  fastify.get('/:dataset/:lon/:lat', {
    schema: {
      description: 'Get single location value by coordinates of dataset',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('lon', S.number()).required()
        .prop('lat', S.number()).required()
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
      description: 'Get array locations in body',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
      // TODO body
    }
  }, async req => {

    return setValue(req.body, defaultDataset)
  });
}