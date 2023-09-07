
module.exports = async fastify => {

  const {datasets, schemas, errors, utils: {bboxContains}} = fastify
      , datasetsList = Object.entries(datasets).map(d => d[1])

  fastify.get('/datasets', {schema: schemas.datasetsList}, async req => {
    return datasetsList;
  });

  fastify.get('/datasets/:datasetId', {schema: schemas.datasetGet}, async req => {

    const {datasetId} = req.params;

    return datasets[ datasetId ] || errors.nodataset;
  });

  fastify.get('/datasets/:lon/:lat', {schema: schemas.datasetsLonlat}, async req => {

    const {lon, lat} = req.params
        , datasetsFound = datasetsList.filter(d => bboxContains(d.bbox, lon, lat));

    return datasetsFound.length ? datasetsFound : errors.nodataset;
  });

  fastify.get('/:datasetId', {schema: schemas.datasetGet}, async req => {

    const {datasetId} = req.params;

    return datasets[ datasetId ] || errors.nodataset;
  });
}