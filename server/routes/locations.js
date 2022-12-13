
const S = require('fluent-json-schema');

module.exports = async fastify => {

  const {config, defaultDataset, gpicker} = fastify
      , {getValue, setValue} = gpicker
      , datasetNames = Object.keys(config.datasets);

  fastify.get('/:dataset/:locations', {
    schema: {
      description: 'Get locations stringified',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
      //  .prop('locations', S.string()).required()
    }
  }, async req => {

    const locations = req.params.locations.split('|').map(a=>a.split(',').map(Number));

    return getValue(locations, defaultDataset)
  });

  fastify.post('/:dataset/locations', {
    schema: {
      description: 'Get array locations in body',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
      //  .prop('locations', S.string()).required()
    }
  }, async req => {

    return setValue(req.body, defaultDataset)
  });

  /* fastify.get('/densify/:locations', (req,res) => {
    // TODO
    return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
  }); */

}