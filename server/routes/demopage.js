
const {resolve, join} = require('path')
    , fs = require('fs');

module.exports = async fastify => {

  const {config} = fastify
      , {demopage: {'path': demourl}} = config
      , favpath = resolve(`${__dirname}/../favicon.png`)
      , favdata = fs.readFileSync(favpath)
      , favurl = join(demourl,'favicon.ico')
      , htmlpath = resolve(`${__dirname}/../../index.html`)
      , html = fs.readFileSync(htmlpath).toString()
      , noCache = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      };

  fastify.addHook('onReady', async () => {
    fastify.log.info(`Demo page available at path: ${demourl}`);
  });

  fastify.get(favurl, {schema: {hide: true}}, async (req, res) => {
    res.type('image/png').send(favdata);
  });

  fastify.get(demourl, {
      schema: {
        hide: true,
        description: 'Interactive demo page which demostrates how it works GeoPicker endpoints',
      }
    }, async (req, res) => {
    await res.headers(noCache).type('text/html').send(html)
  });
}