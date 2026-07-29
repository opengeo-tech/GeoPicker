
module.exports = async fastify => {

  const {config, schemas, datasets, errors, gpicker} = fastify
      , {compress} = config
      , {getValue, setValue} = gpicker;

  fastify.get('/:datasetId/:locations', {schema: schemas.locationsGet, compress}, async req => {

    const dataset = datasets[req.params.datasetId];
    return dataset ? getValue(req.data, dataset) : errors.nodataset;
  });

  fastify.post('/:datasetId/locations', {schema: schemas.locationsPost, compress}, async req => {

    const dataset = datasets[req.params.datasetId];
    return dataset ? setValue(req.data, dataset) : errors.nodataset;
  });
}