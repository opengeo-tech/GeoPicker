
module.exports = async fastify => {

  const {config, schemas, datasetHandles, errors, gpicker} = fastify
      , {setValue} = gpicker
      , {compress} = config;

  fastify.post('/:datasetId/geometry', {schema: {params: schemas.params}, compress}, async req => {
    //FIXME body/response schema (schemas.geometryPost) not work

    const dataset = datasetHandles[req.params.datasetId];
    return dataset ? setValue(req.data, dataset) : errors.nodataset;
  });
}