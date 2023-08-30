
const {resolve, join} = require('path')
    , fs = require('fs');

module.exports = async fastify => {

  const {config} = fastify
      , {prefix, demopage: {path}} = config
      , demopath = join(prefix, path)
      , favicon = fs.readFileSync(`${__dirname}/../favicon.png`)
      , favpath = join(demopath,'favicon.ico')
      , htmlpath = resolve(`${__dirname}/../../index.html`)
      , html = fs.readFileSync(htmlpath).toString()
      , noCache = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      };

  fastify.addHook('onReady', async () => {
    fastify.log.info(`Demo page available at path: ${demopath}`);
  });

  fastify.get(favpath, {schema: {hide: true}}, async (req, res) => {
    res.type('image/png').send(favicon);
  });

  fastify.get(demopath, {
      schema: {
        description: 'Interactive demo page which demostrates how it works GeoPicker endpoints',
      }
    }, async (req, res) => {
    await res.headers(noCache).type('text/html').send(html)
  });
}