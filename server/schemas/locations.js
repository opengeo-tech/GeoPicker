
module.exports = (S, fastify) => {

  const {config: {input_max_locations}} = fastify
      , {query} = require('./query')(S, fastify)
      , {params} = require('./params')(S, fastify);

  // eslint-disable-next-line
  const Locations = params
        .prop('locations',
            S.string()
            // eslint-disable-next-line
            .pattern(/(?=^([^\|]*\|){1,}[^\|]*$)(?=^([^,]*,){2,}[^,]*$)/)
            // contains min 1 pipe and 2 commas
            //.pattern(/^([^,]*,){2,}[^,]*$/)  // contains min 2 commas
            //.pattern(/^([^\|]*\|){1,}[^\|]*$/) // contains min 1 pipe
          ).required()

  return {
    locationsString: {
      description: 'Get multiple locations stringified',
      params: Locations,
      query
    },
    locationsPost: {
      description: 'Post array locations in body',
      params,
      query,
      body: S.array().minItems(2).maxItems(input_max_locations).items(
          S.array().minItems(2).items(S.number())
        ),
      /*response: {
        200: S.array().minItems(2).maxItems(input_max_locations).items(
          S.array().minItems(3).items(S.number())
        )
      }*/
    }
  }
}