
module.exports = async fastify => {

  const {schemas, datasetDefault, gpicker} = fastify
      , {getValue, setValue} = gpicker;

  /**
   * GET
   */
  fastify.get('/:dataset/:lon/:lat', {schema: schemas.lonlatGet}, async req => {

    const val = getValue(req.data, datasetDefault);

    return [val];
  });

  /**
   * POST
   */
  fastify.post('/:dataset/lonlat', {schema: schemas.lonlatPost}, async req => {
    return setValue(req.data, datasetDefault)
  });
}