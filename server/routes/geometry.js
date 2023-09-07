
module.exports = async fastify => {

  const {config, /*schemas,*/ datasetDefault, gpicker} = fastify
      , {setValue} = gpicker
      // eslint-disable-next-line
      , {compress} = config;

  fastify.post('/:dataset/geometry', {/*schema: schemas.geometryPost, */compress}, async req => {
    //FIXME schema not work

    return setValue(req.data, datasetDefault);
  });
}