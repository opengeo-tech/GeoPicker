
module.exports = async fastify => {

  const {/*config,*/ schemas, defaultDataset, gpicker} = fastify
      , {getValue, setValue} = gpicker;

  /**
   * GET
   */
  fastify.get('/:dataset/:lon/:lat', {schema: schemas.lonlat}, async req => {

    const {/*dataset,*/ lon, lat} = req.params
        // TODO use dataset
        , val = getValue([lon, lat], defaultDataset);

    // TODO return multiple val for multiple datasets

    //fastify.log.debug(`response ${val.toString()}`)

    return [val];
  });

  /**
   * POST
   */
  fastify.post('/:dataset/lonlat', {schema: schemas.lonlatPost}, async req => {

    return setValue(req.body, defaultDataset)
  });
}