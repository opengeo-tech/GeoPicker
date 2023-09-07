
module.exports = (S, fastify) => {

  const {datasetsIds} = fastify

  return {
    params: S.object()
        .prop('datasetId',
          S.string().enum(datasetsIds)
        )
        .default('default')
        .required()
  }
}