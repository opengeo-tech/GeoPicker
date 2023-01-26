
module.exports = async fastify => {

  const {config, schemas, defaultDataset, gpicker, valid} = fastify
      , {getValue, setValue} = gpicker;

  // TODO move in module utils
  function parseLocations(textlocs) {
    return textlocs
      .split('|')
      .map(l => l.split(','))
      .map(c => {
        return c.map(parseFloat)
      });
  }

  /**
   * GET
   */
  fastify.get('/:dataset/:locations', {schema: schemas.locationsString}, async (req, res) => {

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

  /**
   * POST
   */
  fastify.post('/:dataset/locations', {schema: schemas.locationsPost}, async req => {

    return setValue(req.body, defaultDataset, {precision: config.output_precision_digits})
  });

  /* fastify.get('/densify/:locations', (req,res) => {
    // TODO
    return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
  }); */

}