
module.exports = (S, fastify) => {

  const {config} = fastify

  return {
    query: S.object()
        .prop('format',
          S.string().enum(config.formats)
        )
        .prop('precision',
          S.number().minimum(1).maximum(10)
        )
  }
}