// TODO https://github.com/opengeo-tech/geopicker/issues/19

const fp = require('fastify-plugin');

function getRouteConfig(r) {
  return r.config ?? {}
}

function listRoutes(routes) {

  if (routes.length === 0) {
    return
  }

  const list = routes.filter(r => getRouteConfig(r).hide !== true).sort((a, b) => a.url.localeCompare(b.url))
      , hiddenMethods = ['OPTIONS','HEAD']
      , rows = [];

  list
  .filter(r => { return !hiddenMethods.includes(r.method); })
  .forEach(route=>{
    rows.push(`${route.method} ${route.path}`);
  })

  return rows;
}

module.exports = fp(async fastify => {

  const routes = [];
  fastify
  .addHook('onRoute', async route => {
      routes.push(route)
  })
  .addHook('onReady', async () => {
    fastify.log.debug(listRoutes(routes));
  });
})