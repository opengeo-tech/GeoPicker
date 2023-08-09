
module.exports = async fastify => {

  const {config, schemas, defaultDataset, gpicker} = fastify
      , {output_precision_digits} = config
      , {getValue, setValue} = gpicker;

  /**
   * GET
   */
  fastify.get('/:dataset/:lon/:lat', {schema: schemas.lonlat}, async req => {

    const {/*dataset,*/ lon, lat} = req.params
        , val = getValue([lon, lat], defaultDataset);

    // TODO use dataset

    return [val];
  });

  /**
   * POST
   */
  fastify.post('/:dataset/lonlat', {schema: schemas.lonlatPost}, async req => {
    return setValue(req.body, defaultDataset, {precision: output_precision_digits})
  });
}