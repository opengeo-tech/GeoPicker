
module.exports = async fastify => {

  const {schemas, errors} = fastify

  /**
   * GET
   */
  fastify.get('/datasets', {schema: schemas.datasets}, async req => {
    return fastify.datasets;
  });

  /**
   * GET
   */
  fastify.get('/datasets/:dataset', {schema: schemas.dataset}, async req => {

    const {dataset} = req.params

    return fastify.datasets[ dataset ] || errors.nodataset;
  });

  /**
   * GET
   */
  fastify.get('/:dataset', {schema: schemas.dataset}, async req => {

    const {dataset} = req.params

    return fastify.datasets[ dataset ] || errors.nodataset;
  });
}