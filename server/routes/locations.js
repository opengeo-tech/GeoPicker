
const S = require('fluent-json-schema');

module.exports = async fastify => {

  const {config, defaultDataset, gpicker} = fastify
      , {getValue} = gpicker
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
    return {
      lon,
      lat,
      val
    }
  });

// TODO https://www.fastify.io/docs/latest/Reference/Server/#maxparamlength
  fastify.get('/:dataset/:locations', {
    schema: {
      description: 'Get multiple locations stringified',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('locations', S.string()).required()
    }
  }, async req => {

    console.log('params',req.params.locations);

    const coordinates = req.params.locations.split('|').map(a=>a.split(',').map(parseFloat));

    return getValue(coordinates, defaultDataset)
  });

  /* fastify.get('/densify/:locations', (req,res) => {
    // TODO
    return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
  }); */

}