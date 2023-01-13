
const S = require('fluent-json-schema')
  , Ajv = require('ajv')

module.exports = async fastify => {

  const {config, defaultDataset, gpicker} = fastify
      , {getValue, setValue} = gpicker
      , datasetNames = Object.keys(config.datasets);

  function validLocations(locs) {
    const ajv = new Ajv({ allErrors: true })
      , schema = S.array().minItems(2).maxItems(config.max_locations).items(
                  S.array().minItems(2).maxItems(2).items(S.number())
                )
      , jschema = schema.valueOf()
    return ajv.compile(jschema)(locs)
  }

  fastify.get('/:dataset/:locations', {
    schema: {
      description: 'Get locations stringified',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('locations', S.string()).required()
    }
  }, async (req, res) => {

    const locations = req.params.locations.split('|').map(a=>a.split(',').map(Number));

    if (validLocations(locations)) {
      return getValue(locations, defaultDataset);
    }
    else {
      res.status(400).send(config.errors.nolocations);
    }
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