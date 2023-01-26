
const S = require('fluent-json-schema');

module.exports = config => ({
  ...require('./datasets')(S, config),
  ...require('./geometry')(S, config)
});
