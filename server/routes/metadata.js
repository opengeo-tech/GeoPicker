
module.exports = async fastify => {

  const {schemas, utils: {getMetadata}} = fastify;

  fastify.get('/metadata/:locations', {schema: schemas.metadataLocations}, async req => {

    return getMetadata(req.data);
  });

  fastify.post('/metadata/geometry', {schema: schemas.metadataGeometry}, async req => {

    return getMetadata(req.data);
  });
}