
module.exports = async fastify => {

  const {datasets, errors, schemas, utils: {contourLines}} = fastify

  fastify.get('/:datasetId/contour/:lon/:lat', {schema: schemas.lonlatGet}, async req => {
      const dataset = datasets[req.params.datasetId];
      return dataset ? contourLines(dataset, req.data) : errors.nodataset;
  });
}