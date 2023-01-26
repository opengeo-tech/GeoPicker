
// const S = require('fluent-json-schema')

const fs = require('fs');

module.exports = async fastify => {

  const {config, status, gpicker, package} = fastify
      , {name, version} = package
      , {attribution} = config

  const icon = fs.readFileSync(`${__dirname}/../favicon.png`)

  fastify.get('/favicon.ico', async (req,res) => {
    //res.code(404).send(`It's an API Rest!`)
    res.type('image/png').send(icon);
  })

  fastify.get('/', async () => ({
    name,
    version,
    gdal: gpicker.gdal.version,
    attribution,
    status
  }));
}