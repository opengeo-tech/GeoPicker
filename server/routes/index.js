
const S = require('fluent-json-schema');

module.exports = async fastify => {

  const {config, defaultDataset, gpicker} = fastify
      , {setValue, getValue} = gpicker;


  fastify.get('/:dataset/:lon/:lat', {
    schema: {
      description: 'Get single location value by coordinates of dataset',
      params: S.object()
      .prop('dataset', S.string().enum(Object.keys(config.datasets))).required()
      .prop('lon', S.number()).required()
      .prop('lat', S.number()).required()
    }
  }, async req => {

    console.log('params',req.params);

    const {lon, lat} = req.params;

    return {
      lon,
      lat,
      val: getValue([lon, lat], defaultDataset)
    }
  });

  fastify.post('/:dataset/geometry', {
    // https://github.com/opengeo-tech/geopicker/issues/16
    schema: {
      description: 'Post a geojson geometry',
      body: S.object()
        // .additionalProperties(false)
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
  },async req => {
    console.log('REQUEST',req.body);
    return setValue(req.body, defaultDataset);
  });

/* fastify.post('/:dataset/:band/pixel', async req => {
    return setValue(req.body, defaultDataset);
  });

  fastify.get('/:dataset/:band/pixel', async req => {
    const point = getValue(req.params, defaultDataset)
  });
*/

  fastify.post('/densify/geometry', async req => {
    const densify = !!req.query.densify || config.densify;
    console.log(req.body)
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