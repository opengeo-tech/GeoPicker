
const S = require('fluent-json-schema');

module.exports = async fastify => {

  const {config, defaultDataset, gpicker, valid} = fastify
      , {getValue, setValue} = gpicker
      , datasetNames = Object.keys(config.datasets);

  function parseLocations(textlocs) {
    return textlocs
      .split('|')
      .map(l => l.split(','))
      .map(c => {
        return c.map(parseFloat)
      });
  }

  fastify.get('/:dataset/:locations', {
    schema: {
      description: 'Get locations stringified',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('locations',
            S.string()
            // eslint-disable-next-line
            .pattern(/(?=^([^\|]*\|){1,}[^\|]*$)(?=^([^,]*,){2,}[^,]*$)/)
            // contains min 1 pipe and 2 commas
            /*.pattern(/^([^,]*,){2,}[^,]*$/)  // contains min 2 commas
            .pattern(/^([^\|]*\|){1,}[^\|]*$/) // contains min 1 pipe*/
          ).required()
    }
  }, async (req, res) => {

    const locations = parseLocations(req.params.locations);

    if (config.input_validation===false || valid.locations(locations)) {
      return getValue(locations, defaultDataset);
    }
    else {
      res.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: config.errors.nolocations
      });
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