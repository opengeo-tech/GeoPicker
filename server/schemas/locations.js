
module.exports = (S, fastify) => {

  const {config: {maxLocations, sepLocations: sepL, sepCoords: sepC}} = fastify
      , {params} = require('./params')(S, fastify)
      , {query} = require('./query')(S, fastify);

  //TODO manage other chars (only pipe require \|)
  const regText = `(?=^([^\${sepL}]*${sepL}){1,}[^\${sepL}]*$)(?=^([^${sepC}]*${sepC}){2,}[^${sepC}]*$)`
      , regLocs = new RegExp(regText);
  //const regLocs =/(?=^([^\|]*\|){1,}[^\|]*$)(?=^([^,]*,){2,}[^,]*$)/
  // contains min 1 pipe and 2 commas
  //min 1 pipe: /^([^,]*,){2,}[^,]*$/
  //min 1 pipe: /^([^\|]*\|){1,}[^\|]*$/

  const Locations = params
        .prop('locations',
            S.string().pattern(regLocs)
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
      body: S.array().minItems(2).maxItems(maxLocations).items(
          S.array().minItems(2).items(S.number())
        ),
      /*response: {
        200: S.array().minItems(2).maxItems(maxLocations).items(
          S.array().minItems(3).items(S.number())
        )
      }*/
    }
  }
}