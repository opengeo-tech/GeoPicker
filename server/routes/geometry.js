
const S = require('fluent-json-schema');

module.exports = async fastify => {

  const {config, defaultDataset, gpicker} = fastify
      , {setValue} = gpicker
      , datasetNames = Object.keys(config.datasets);

  fastify.post('/:dataset/geometry', {
    schema: {
      description: 'Post a geojson geometry',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required(),
      // TODO query: S.object().prop('band', S.integer().default(1)),
      body: S.object()
        .oneOf([
            S.object()
            .prop('type', S.string().const('Point')).required()
            .prop('coordinates', S.array().maxItems(2).items(S.number())).required()
          ,
            S.object()
            .prop('type', S.string().const('LineString')).required()
            .prop('coordinates', S.array().minItems(2).maxItems(config.max_locations).items(
              S.array().maxItems(2).items(S.number())
            )).required()
        ])
      /* response: {
        200: S.object().prop('created', S.boolean())
      } */
    }
  }, async req => {
    return setValue(req.body, defaultDataset);
  });

  fastify.post('/densify/geometry', async req => {
    const densify = !!req.query.densify || config.densify;
    return densify(req.body, densify);
  });

  /* fastify.post('/simplify/geometry', async req => {
  }); */

  /* fastify.post('/meta/geometry', (req,res) => {
    return meta(req.body)
  }); */
}