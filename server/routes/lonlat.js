
module.exports = async fastify => {

  const {schemas, datasetDefault, gpicker} = fastify
      , {getValue, setValue} = gpicker;

  fastify.get('/:datasetId/:lon/:lat', {schema: schemas.lonlatGet}, async req => {

    const val = getValue(req.data, datasetDefault);

    return [val];
  });

  fastify.post('/:datasetId/lonlat', {schema: schemas.lonlatPost}, async req => {

    return setValue(req.data, datasetDefault)
  });
}