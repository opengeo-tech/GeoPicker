
module.exports = async fastify => {

  const {config, /*schemas,*/ datasetDefault, gpicker} = fastify
      // eslint-disable-next-line
      , {compress} = config
      , {setValue} = gpicker;

  /**
   * POST
   */
  fastify.post('/:dataset/geometry', {/*schema: schemas.geometry, */compress}, async req => {
    //FIXME schema not work
    return setValue(req.data, datasetDefault);
  });

  /* fastify.post('/meta/geometry', (req,res) => {
    return meta(req.body)
  }); */
}