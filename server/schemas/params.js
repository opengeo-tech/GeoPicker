
module.exports = (S, fastify) => {

  const {datasets} = fastify

  return {
    params: S.object()
        .prop('datasetId',
          S.string().enum(Object.keys(datasets))
        )
        .default('default')
        .required()
  }
}