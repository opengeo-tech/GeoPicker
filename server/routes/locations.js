
module.exports = async fastify => {

  const {config, schemas, datasetDefault, gpicker} = fastify
      , {compress, sepLocs, sepCoords} = config
      , {getValue, setValue} = gpicker;

  /**
   * GET
   */
  fastify.get('/:dataset/:locations', {schema: schemas.locationsString, compress}, async req => {

    return getValue(req.data, datasetDefault, {sepLocs, sepCoords});
  });

  /**
   * POST
   */
  fastify.post('/:dataset/locations', {schema: schemas.locationsPost, compress}, async req => {

    return setValue(req.data, datasetDefault);
  });
}