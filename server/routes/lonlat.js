
module.exports = async fastify => {

  const {schemas, defaultDataset, gpicker} = fastify
      , {getValue, setValue} = gpicker;

  /**
   * GET
   */
  fastify.get('/:dataset/:lon/:lat', {schema: schemas.lonlat}, async req => {

    //TODO if (input_validation===true valid.lonlat([lon,lat])) {
    const {/*dataset,*/ lon, lat} = req.params
        , val = getValue([lon, lat], defaultDataset);

    // TODO use dataset

    return [val];
  });

  /**
   * POST
   */
  fastify.post('/:dataset/lonlat', {schema: schemas.lonlatPost}, async req => {
    return setValue(req.body, defaultDataset)
  });
}