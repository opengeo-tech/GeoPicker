
module.exports = async fastify => {

  const {config, schemas, defaultDataset, gpicker} = fastify
      , {setValue} = gpicker;

  fastify.post('/:dataset/geometry', {
    schema: schemas.geometry
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