
module.exports = async fastify => {

  const {config, /*schemas,*/ defaultDataset, gpicker} = fastify
      // eslint-disable-next-line
      , {output_precision_digits, densify, compress} = config
      , {setValue} = gpicker;

  /**
   * POST
   */
  fastify.post('/:dataset/geometry', {
      //TODO not work schema: schemas.geometry,
      compress}, async req => {
    return setValue(req.body, defaultDataset, {
      // eslint-disable-next-line
      precision: output_precision_digits
    });
  });

  /**
   * POST densify
   */
  /* fastify.post('/densify/geometry', async req => {
    const densify = !!req.query.densify || densify;
    return densify(req.body, densify);
  });*/

  /* fastify.post('/simplify/geometry', async req => {
  }); */

  /* fastify.post('/meta/geometry', (req,res) => {
    return meta(req.body)
  }); */
}