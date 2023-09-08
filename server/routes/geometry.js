
module.exports = async fastify => {

  const {config, /*schemas,*/ datasetDefault, gpicker} = fastify
      , {setValue} = gpicker
      , {compress} = config;

  fastify.post('/:datasetId/geometry', {/*schema: schemas.geometryPost,*/ compress}, async req => {
    //FIXME schema not work

    return setValue(req.data, datasetDefault);
  });
}