
const S = require('fluent-json-schema');

module.exports = async fastify => {

  const {config, defaultDataset, gpicker} = fastify
      , {setValue, getValue} = gpicker
      , datasetNames = Object.keys(config.datasets);

  fastify.get('/:dataset/:lon/:lat', {
    schema: {
      description: 'Get single location value by coordinates of dataset',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('lon', S.number()).required()
        .prop('lat', S.number()).required()
    }
  }, async req => {

    const {/*dataset,*/ lon, lat} = req.params;

    const val = getValue([lon, lat], defaultDataset);
    return {
      lon,
      lat,
      val
    }
  });

// TODO https://www.fastify.io/docs/latest/Reference/Server/#maxparamlength
  fastify.get('/:dataset/:locations', {
    schema: {
      description: 'Get multiple locations stringified',
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('locations', S.string()).required()
    }
  }, async req => {

    console.log('params',req.params.locations);

    const coordinates = req.params.locations.split('|').map(a=>a.split(',').map(parseFloat));

    return getValue(coordinates, defaultDataset)
  });

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

  /* fastify.get('/densify/:locations', (req,res) => {
    // TODO
    return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
  }); */

  /* fastify.post('/simplify/geometry', async req => {
  }); */

  /* fastify.post('/meta', (req,res) => {
    return meta(req.body)
  }); */
}