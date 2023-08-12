
// TODO convert in plugin, pass fastify
const S = require('fluent-json-schema');

//TODO pass fastify instead config
module.exports = config => ({
  ...require('./datasets')(S, config),
  ...require('./locations')(S, config),
  ...require('./geometry')(S, config),
  ...require('./lonlat')(S, config),
  ...require('./query')(S, config),
});
