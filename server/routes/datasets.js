
// const S = require('fluent-json-schema')

module.exports = async fastify => {

  const {config, schemas} = fastify;

  fastify.get('/datasets', {
    schema: schemas.datasets
  }, async req => {
    return fastify.datasets;
  });

  fastify.get('/:dataset', {
    schema: schemas.dataset
  }, async req => {

    const {dataset} = req.params

    return fastify.datasets[ dataset ] || config.errors.nodataset;
  });
}