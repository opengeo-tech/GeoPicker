/**
 * defines commons errors texts in output
 */
const fp = require('fastify-plugin');

const errors = {
  nodatadir: ["Data directory not exists", 500],
  nodataset: ["Dataset not found", 404],
  nodatasets: ["At least one default dataset is required", 500],
  nodatasetdefault: ["Default dataset file not exists", 500],
  //noformat: ["Request format not supported", 400],
  //nolocations: ["Require array of locations", 400],
};

module.exports = fp(async fastify => {

  //convert in Error objects
  for (const id in errors) {
    const [message, code] = errors[id]
    errors[id] = new Error(message);
    errors[id].statusCode = code;
  }

  fastify.decorate('errors', errors);
})
