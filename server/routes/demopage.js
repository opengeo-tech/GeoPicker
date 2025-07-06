
const {resolve, join} = require('path')
    , {readFile} = require('fs/promises');

module.exports = async fastify => {

  const {config} = fastify
      , {demopage: {url}} = config
      , favpath = resolve(`${__dirname}/../../favicon.png`)
      , favdata = await readFile(favpath)
      , favurl = join(url,'favicon.ico')
      , htmlpath = resolve(`${__dirname}/../../index.html`)
      , noCache = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      };

  fastify.addHook('onReady', async () => {
    fastify.log.info(`Demo page available at path: ${url}`);
  });

  fastify.get(favurl, {schema: {hide: true}}, async (req, res) => {
    res.type('image/png').send(favdata);
  });

  fastify.get(url, {
      schema: {
        hide: true,
        description: 'Interactive demo page which demostrates how it works GeoPicker endpoints',
      }
    }, async (req, res) => {
    const html = await readFile(htmlpath, 'utf-8');
    await res.headers(noCache).type('text/html').send(html);
  });
}
