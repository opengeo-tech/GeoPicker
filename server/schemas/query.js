
module.exports = (S, config) => {

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