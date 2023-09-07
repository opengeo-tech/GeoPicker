
module.exports = async fastify => {

  const {config, schemas, datasetDefault, gpicker} = fastify
      , {compress, sepLocs, sepCoords} = config
      , {getValue, setValue} = gpicker;

  fastify.get('/:datasetId/:locations', {schema: schemas.locationsGet, compress}, async req => {

    return getValue(req.data, datasetDefault, {sepLocs, sepCoords});
  });

  fastify.post('/:datasetId/locations', {schema: schemas.locationsPost, compress}, async req => {

    return setValue(req.data, datasetDefault);
  });
}