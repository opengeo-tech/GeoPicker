
module.exports = async fastify => {

  const {config, /*schemas,*/ datasetDefault, gpicker} = fastify
      // eslint-disable-next-line
      , {densify, compress} = config
      , {setValue/*, utils*/} = gpicker;

  /**
   * POST
   */
  fastify.post('/:dataset/geometry', {/*schema: schemas.geometry, */compress}, async req => {
    //FIXME schema not work
    return setValue(req.data, datasetDefault);
  });

  /**
   * POST densify
   */
  /* fastify.post('/densify/geometry', async req => {
    const densify = !!req.query.densify || densify;
    return utils.densifyGeometry(req.body, densify);
  });*/

  /* fastify.post('/simplify/geometry', async req => {
  }); */

  /* fastify.post('/meta/geometry', (req,res) => {
    return meta(req.body)
  }); */
}