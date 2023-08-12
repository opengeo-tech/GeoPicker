
module.exports = (S, config) => {

  const datasetNames = Object.keys(config.datasets);

  return {
    params: S.object().prop('dataset', S.string().enum(datasetNames)).required(),
  }
}