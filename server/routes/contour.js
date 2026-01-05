
module.exports = async fastify => {

  const {datasetDefault, schemas, utils: {contourLines}} = fastify

  fastify.get('/:datasetId/contour/:lon/:lat', {schema: schemas.locationsArray}, async req => {
      return contourLines(datasetDefault, req.data);
  });
}