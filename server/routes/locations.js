
module.exports = async fastify => {

  const {config, schemas, defaultDataset, gpicker/*, errors*/} = fastify
      , {compress, sepLocs, sepCoords} = config
      , {getValue, setValue} = gpicker;

  /**
   * GET
   */
  fastify.get('/:dataset/:locations', {schema: schemas.locationsString, compress}, async req => {

    return getValue(req.data, defaultDataset, {sepLocs, sepCoords});
  });

  /**
   * POST
   */
  fastify.post('/:dataset/locations', {schema: schemas.locationsPost, compress}, async req => {

    return setValue(req.data, defaultDataset);
  });

  /* fastify.get('/densify/:locations', (req,res) => {
    // TODO
    return {densify:1}//res.code(400).send({status: errors.densify_nobody})
  }); */

}