
module.exports = async fastify => {

  const {datasets, schemas, errors} = fastify

  /**
   * GET
   */
  fastify.get('/datasets', {schema: schemas.datasets}, async req => {
    return datasets;
  });

  /**
   * GET
   */
  fastify.get('/datasets/:dataset', {schema: schemas.dataset}, async req => {

    const {dataset} = req.params

    return datasets[ dataset ] || errors.nodataset;
  });

  /**
   * GET
   */
  fastify.get('/:dataset', {schema: schemas.dataset}, async req => {

    const {dataset} = req.params

    return datasets[ dataset ] || errors.nodataset;
  });
}