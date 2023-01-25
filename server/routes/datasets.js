
// const S = require('fluent-json-schema')

module.exports = async fastify => {

  const {config} = fastify;

  fastify.get('/datasets', {
      /* TODO define when format is definitive
      schema: {
        description: 'List datasets available',
        response: {
          200: S.object()
              .patternProperties({
                  '.*': S.object()
                  .prop('path', S.string())
                  .prop('band', S.integer())
              })
        }
      }*/
  }, async req => {
    return fastify.datasets;
  });

  fastify.get('/:dataset', async req => {

    const {dataset} = req.params

    return fastify.datasets[ dataset ] || config.errors.nodataset;
  });
}