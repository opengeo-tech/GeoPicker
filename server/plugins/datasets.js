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
  for (let [key, val] of Object.entries(config.datasets)) {

    if (val != null && typeof val.valueOf() === 'string' && config.datasets[ val ]) {
      val = config.datasets[ val ];
    }

    if(val.path) {
      let file = path.join(config.datapath, val.path);
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

    fastify.log.info(JSON.stringify(defaultDataset.info(),null,4), `Default dataset loaded: ${defaultFile}`);

    fastify.decorate('defaultDataset', defaultDataset );
  }
  else {
    fastify.status = config.errors.nodefaultdataset;
    fastify.log.warn(config.errors.nodefaultdataset);
  }

  fastify.decorate('datasets', listDatasets(config));
});