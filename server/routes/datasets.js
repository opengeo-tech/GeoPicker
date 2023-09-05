
module.exports = async fastify => {

  const {datasets, schemas, errors} = fastify
      , datasetsList = Object.entries(datasets).map(d => ({id: d[0], ...d[1] }))

  /**
   * GET
   */
  fastify.get('/datasets', {schema: schemas.datasets}, async req => {
    return datasetsList;
  });

  /**
   * GET
   */
  fastify.get('/datasets/:dataset', {schema: schemas.dataset}, async req => {

    const {dataset} = req.params

    return datasets[ dataset ] || errors.nodataset;
  });

  /**
   * GET short alias enpoint
   */
  fastify.get('/:dataset', {schema: schemas.dataset}, async req => {

    const {dataset} = req.params

    return datasets[ dataset ] || errors.nodataset;
  });
}