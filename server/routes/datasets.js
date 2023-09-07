
module.exports = async fastify => {

  const {gpicker, datasets, schemas, errors} = fastify
      , {utils: {bboxContains} } = gpicker
      , datasetsList = Object.entries(datasets).map(d => d[1])

  fastify.get('/datasets', {schema: schemas.datasetsList}, async req => {
    return datasetsList;
  });

  fastify.get('/datasets/:datasetId', {schema: schemas.datasetGet}, async req => {

    const {datasetId} = req.params;

    return datasets[ datasetId ] || errors.nodataset;
  });

  fastify.get('/:datasetId', {schema: schemas.datasetGet}, async req => {

    const {datasetId} = req.params;

    return datasets[ datasetId ] || errors.nodataset;
  });

  fastify.get('/datasets/:lon/:lat', {schema: schemas.datasetsLonlat}, async req => {

    const {lon, lat} = req.params;

    const datasetsFound = datasetsList.filter(d => bboxContains(d.bbox, lon, lat));

    return datasetsFound.length ? datasetsFound : errors.nodataset;
  });

}