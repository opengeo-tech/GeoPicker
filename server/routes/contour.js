
module.exports = async fastify => {

  const {datasetHandles, errors, schemas, utils: {contourLines}} = fastify

  fastify.get('/:datasetId/contour/:lon/:lat', {schema: schemas.locationsArray}, async req => {
      const dataset = datasetHandles[req.params.datasetId];
      return dataset ? contourLines(dataset, req.data) : errors.nodataset;
  });
}