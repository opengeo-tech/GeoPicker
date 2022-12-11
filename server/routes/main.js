
// const S = require('fluent-json-schema')

module.exports = async fastify => {

  const {status, gpicker, pkg} = fastify
      , {name, version} = pkg;

  fastify.get('/', async () => ({
    name,
    version,
    gdal: gpicker.gdal.version,
    status
  }));

  fastify.get('/datasets', {
      /* TODO define when format is definitive schema: {
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
  }, async () => {
      return fastify.datasets;
  });
}