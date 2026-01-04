
module.exports = async fastify => {

  const {datasetDefault, utils: {contourLines}} = fastify

  fastify.get('/:datasetId/contour/:lon/:lat', {/*schema: schemas.lonlatGet*/}, async req => {
      return contourLines(datasetDefault, req.data);
  });
}