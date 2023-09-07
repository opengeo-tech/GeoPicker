
module.exports = async fastify => {

  const {datasets, schemas, errors} = fastify
      , datasetsList = Object.entries(datasets).map(d => d[1])

  fastify.get('/datasets', {schema: schemas.datasetsList}, async req => {
    return datasetsList;
  });

  fastify.get('/datasets/:datasetId', {schema: schemas.datasetGet}, async req => {

    const {datasetId} = req.params

    return datasets[ datasetId ] || errors.nodataset;
  });

  fastify.get('/:datasetId', {schema: schemas.datasetGet}, async req => {

    const {datasetId} = req.params

    return datasets[ datasetId ] || errors.nodataset;
  });
}