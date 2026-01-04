
module.exports = async fastify => {

  const {schemas, utils: {metadata}} = fastify;

  fastify.get('/metadata/:locations', {schema: schemas.metadataLocations}, async req => {

    return metadata(req.data);
  });

  fastify.post('/metadata/geometry', {schema: schemas.metadataGeometry}, async req => {

    return metadata(req.data);
  });
}