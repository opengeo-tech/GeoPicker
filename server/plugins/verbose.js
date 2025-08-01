/**
 * manage verbose mode and log some debugging informations at startup
 */
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
    fastify.log.info(fastify.config, 'CONFIG');
    fastify.log.info(listRoutes(routes), 'ENDPOINTS');
  });
})
