
function getRouteConfig(r) {
  return r.config ?? {}
}

function listRoutes(routes) {

  if (routes.length === 0) {
    return
  }

  routes = routes.filter(r => getRouteConfig(r).hide !== true).sort((a, b) => a.url.localeCompare(b.url))

  const hasDescription = routes.some(r => 'description' in getRouteConfig(r))

  const hiddenMethods = ['OPTIONS','HEAD'];

  const rows = []

  routes = routes.filter(r => { return !hiddenMethods.includes(r.method); })

  for (const route of routes) {
    rows.push(`${route.method} ${route.path}`);
  }

  return rows;
}

module.exports = {
  listRoutes
}