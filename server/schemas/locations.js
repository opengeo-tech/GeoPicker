
module.exports = (S, config) => {

  return {
    locationsString: {
      description: 'Get locations stringified',
      params: S.object()
        .prop('dataset', S.string().enum(Object.keys(config.datasets))).required()
        .prop('locations',
            S.string()
            // eslint-disable-next-line
            .pattern(/(?=^([^\|]*\|){1,}[^\|]*$)(?=^([^,]*,){2,}[^,]*$)/)
            // contains min 1 pipe and 2 commas
            /*.pattern(/^([^,]*,){2,}[^,]*$/)  // contains min 2 commas
            .pattern(/^([^\|]*\|){1,}[^\|]*$/) // contains min 1 pipe*/
          ).required()
    },
    locationsPost: {
      description: 'Post array locations in body',
      params: S.object().prop('dataset', S.string().enum(Object.keys(config.datasets))).required()
      // TODO body
    }
  }
}