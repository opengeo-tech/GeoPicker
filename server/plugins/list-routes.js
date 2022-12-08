
function getRouteConfig(r) {
  return r.config ?? {}
}

function listRoutes(routes) {

  if (routes.length === 0) {
    return
  }

  const list = routes.filter(r => getRouteConfig(r).hide !== true).sort((a, b) => a.url.localeCompare(b.url))

  const hasDescription = list.some(r => 'description' in getRouteConfig(r))

  const hiddenMethods = ['OPTIONS','HEAD'];

  const rows = []

  const listRoutes = list.filter(r => { return !hiddenMethods.includes(r.method); })

  for (const route of listRoutes) {
    rows.push(`${route.method} ${route.path}`);
  }

  return rows;
}

module.exports = async fastify => {

  const routes = [];
  fastify
  .addHook('onRoute', route => {
      routes.push(route)
  })
  .addHook('onReady', async () => {
    fastify.log.debug('routes:', listRoutes(routes));
  });
}