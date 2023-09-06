
module.exports = async fastify => {

  const {config, /*schemas,*/ datasetDefault, gpicker} = fastify
      // eslint-disable-next-line
      , {compress} = config
      , {setValue, utils: {getMetadata} } = gpicker;

  /**
   * POST
   */
  fastify.post('/:dataset/geometry', {/*schema: schemas.geometry, */compress}, async req => {
    //FIXME schema not work
    return setValue(req.data, datasetDefault);
  });

  /**
   * POST
   */
  fastify.post('/metadata/geometry', /*{schema: schemas.metadata}, */ async req => {
    return getMetadata(req.body)
  });
}