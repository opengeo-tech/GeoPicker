
const fs = require('fs')
    , path = require('path')
    , _ = require('lodash');


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

function listDatasets(config) {
  const dats = {
    default: config.default_dataset
  };
  for (const [key, val] of Object.entries(config.datasets)) {

    const file = path.join(config.datapath, val.path);
    if (fs.existsSync(file)) {
      dats[ key ] = {
        band: 1,
        pixel: 30,
        bbox: []
        //TODO fill use gdal
      }
    }
    else {
      console.warn(`dataset ${file} not exists`)
    }
  }
  //TODO decore with bands of each raster and fields of each shapes

  return dats;
}

module.exports = config => ({
  listRoutes,
  datasets: listDatasets(config)
})