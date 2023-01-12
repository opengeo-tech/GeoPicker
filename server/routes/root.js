
// const S = require('fluent-json-schema')

module.exports = async fastify => {

  const {config, status, gpicker, package} = fastify
      , {name, version} = package;

  fastify.get('/', async () => ({
    name,
    version,
    gdal: gpicker.gdal.version,
    status
  }));

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

  fastify.get('/:dataset', {
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

    const {dataset} = req.params

    return fastify.datasets[ dataset ] || config.errors.nodataset;
  });
}