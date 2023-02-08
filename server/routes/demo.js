
const path = require('path')
    , fs = require('fs')
    , favicon = fs.readFileSync(`${__dirname}/../favicon.png`);

module.exports = async fastify => {

  const {config} = fastify
      , htmlpath = path.resolve(`${__dirname}/../../index.html`)
      , html = fs.readFileSync(htmlpath).toString()
      , noCache = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      };

  fastify.addHook('onReady', async () => {
    fastify.log.info(`Demo page available at path: ${config.demo_path}`);
  });

  fastify.get(path.join(config.demo_path,'favicon.png'), async (req, res) => {
    res.type('image/png').send(favicon);
  });

  fastify.get(config.demo_path, async (req, res) => {
    await res.headers(noCache).type('text/html').send(html)
  });
}