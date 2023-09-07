
module.exports = async fastify => {

  const {datasets, schemas, errors} = fastify
      , datasetsList = Object.entries(datasets).map(d => d[1])

  fastify.get('/datasets', {schema: schemas.datasetsList}, async req => {
    return datasetsList;
  });

  fastify.get('/datasets/:dataset', {schema: schemas.datasetGet}, async req => {

    const {dataset} = req.params

    return datasets[ dataset ] || errors.nodataset;
  });

  fastify.get('/:dataset', {schema: schemas.datasetGet}, async req => {

    const {dataset} = req.params

    return datasets[ dataset ] || errors.nodataset;
  });
}