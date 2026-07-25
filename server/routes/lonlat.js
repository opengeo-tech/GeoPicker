
module.exports = async fastify => {

  const {schemas, datasetHandles, errors, gpicker} = fastify
      , {getValue, setValue} = gpicker;

  fastify.get('/:datasetId/:lon/:lat', {schema: schemas.lonlatGet}, async req => {

    const dataset = datasetHandles[req.params.datasetId];
    return dataset ? getValue(req.data, dataset) : errors.nodataset;
  });

  fastify.post('/:datasetId/lonlat', {schema: schemas.lonlatPost}, async req => {

    const dataset = datasetHandles[req.params.datasetId];
    return dataset ? setValue(req.data, dataset) : errors.nodataset;
  });
}