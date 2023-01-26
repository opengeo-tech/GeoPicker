
const fs = require('fs')
    , favicon = fs.readFileSync(`${__dirname}/../favicon.png`);

module.exports = async fastify => {

  const {config, status, gpicker, package} = fastify
      , {name, version} = package
      , {attribution} = config

  fastify.get('/favicon.ico', async (req,res) => {
    //res.code(404).send(`It's an API Rest!`)
    res.type('image/png').send(favicon);
  });

  fastify.get('/', async () => ({
    name,
    version,
    gdal: gpicker.gdal.version,
    attribution,
    status
  }));
}