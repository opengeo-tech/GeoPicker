
module.exports = (S, config) => {

  const {query} = require('./query')(S, config)
      , datasetNames = Object.keys(config.datasets);

  return {
    locationsString: {
      description: 'Get multiple locations stringified',
      query,
      params: S.object()
        .prop('dataset', S.string().enum(datasetNames)).required()
        .prop('locations',
            S.string()
            // eslint-disable-next-line
            .pattern(/(?=^([^\|]*\|){1,}[^\|]*$)(?=^([^,]*,){2,}[^,]*$)/)
            // contains min 1 pipe and 2 commas
            //.pattern(/^([^,]*,){2,}[^,]*$/)  // contains min 2 commas
            //.pattern(/^([^\|]*\|){1,}[^\|]*$/) // contains min 1 pipe
          ).required()
    },
    locationsPost: {
      description: 'Post array locations in body',
      params: S.object().prop('dataset', S.string().enum(datasetNames)).required(),
      query,
      body: S.array().minItems(2).maxItems(config.input_max_locations).items(
          S.array().minItems(2).items(S.number())
        ),
      /*response: {
        200: S.array().minItems(2).maxItems(config.input_max_locations).items(
          S.array().minItems(3).items(S.number())
        )
      }*/
    }
  }
}