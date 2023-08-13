
module.exports = async fastify => {

  const {config, schemas, defaultDataset, gpicker, errors, valid} = fastify
      , {input_validation, compress} = config
      , {getValue, setValue, utils: {parseLocations}} = gpicker;

  /**
   * GET
   */
  fastify.get('/:dataset/:locations', {
    schema: schemas.locationsString,
    preHandler: (req, res, done) => {

      req.locations = parseLocations(req.params.locations);

      done();
    }
  }, async (req, res) => {

    const {locations} = req;

    if (input_validation===false || valid.arrayLocs(locations)) {
      return getValue(locations, defaultDataset);
    }
    else {
      //TODO move inside valid.locations()
      res.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: errors.nolocations
      });
    }
  });

  /**
   * POST
   */
  fastify.post('/:dataset/locations', {schema: schemas.locationsPost, compress}, async req => {

    return setValue(req.body, defaultDataset);
  });

  /* fastify.get('/densify/:locations', (req,res) => {
    // TODO
    return {densify:1}//res.code(400).send({status: errors.densify_nobody})
  }); */

}