
module.exports = async fastify => {

  const {schemas, datasetDefault, gpicker} = fastify
      , {getValue, setValue} = gpicker;

  fastify.get('/:datasetId/:lon/:lat', {schema: schemas.lonlatGet}, async req => {

    return getValue(req.data, datasetDefault);
  });

  fastify.post('/:datasetId/lonlat', {schema: schemas.lonlatPost}, async req => {

    return setValue(req.data, datasetDefault)
  });
}