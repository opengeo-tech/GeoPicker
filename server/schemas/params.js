
module.exports = (S, fastify) => {

  const {datasetsNames} = fastify

  return {
    params: S.object()
        .prop('dataset',
          S.string().enum(datasetsNames)
        ).required(),
  }
}