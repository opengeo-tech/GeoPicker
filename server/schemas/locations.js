
module.exports = (S, fastify) => {

  const {config: {maxLocations, sepLocs, sepCoords}} = fastify
      , {params} = require('./params')(S, fastify)
      , {query} = require('./query')(S, fastify);

  //FIXME manage other chars for sepLocs (only pipe require a slash before `\|`)
  const regText = `(?=^([^\${sepLocs}]*${sepLocs}){1,}[^\${sepLocs}]*$)(?=^([^${sepCoords}]*${sepCoords}){2,}[^${sepCoords}]*$)`
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