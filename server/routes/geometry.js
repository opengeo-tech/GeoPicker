
module.exports = async fastify => {

  const {config, /*schemas,*/ datasetHandles, errors, gpicker} = fastify
      , {setValue} = gpicker
      , {compress} = config;

  fastify.post('/:datasetId/geometry', {/*schema: schemas.geometryPost,*/ compress}, async req => {
    //FIXME schema not work

    const dataset = datasetHandles[req.params.datasetId];
    return dataset ? setValue(req.data, dataset) : errors.nodataset;
  });
}