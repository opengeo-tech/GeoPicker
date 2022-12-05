/*
  manage dataset define in config.yml
 */
const fs = require('fs')
    , path = require('path');

const fp = require('fastify-plugin');

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
      console.warn(`Dataset ${file} not exists!`)
    }
  }
  //TODO decore with bands of each raster and fields of each shapes

  return dats;
}


module.exports = fp(async fastify => {

  const {config, gpicker} = fastify;


  if (!fs.existsSync(config.datapath)) {
    throw config.errors.nodatadir
  }

  const def = config.datasets[ config.default_dataset ]
    , defaultFile = `${config.datapath}/${def.path}`

  if (fs.existsSync(defaultFile)) {

    const defaultDataset = gpicker.openFile(defaultFile, def.band, def.epsg);

    console.log(`Default dataset loaded: ${defaultFile}`)
    console.log(JSON.stringify(defaultDataset.info(),null,4));

    fastify.decorate('defaultDataset', defaultDataset );
  }
  else {
    fastify.status = config.errors.nodefaultdataset;
    console.warn(config.errors.nodefaultdataset);
  }

  fastify.decorate('datasets', listDatasets(config));

})