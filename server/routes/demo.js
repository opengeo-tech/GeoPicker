
const fs = require('fs')
  , path = require('path');

module.exports = async fastify => {

  const htmlpath = path.resolve(`${__dirname}/../../index.html`)
    , html = fs.readFileSync(htmlpath).toString();

  fastify.get('/test', async (req, res) => {
    await res.type('text/html').send(html)
  });

  fastify.addHook('onReady', async () => {
    console.log('Demo page available at path: /test');
  });
}