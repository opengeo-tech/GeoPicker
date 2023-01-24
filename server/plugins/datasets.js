/*
  manage dataset define in config.yml
 */
const fs = require('fs')
    , fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {datapath, datasets} = config
      , def = datasets[ datasets.default ] // (datasets.default && typeof datasets.default.valueOf()==='string') ?
      , defaultFile = `${datapath}/${def.path}`
      , listDatasets = {
        default: datasets[ datasets.default ]
      };

  for (let [key, val] of Object.entries(datasets)) {

    if (val != null && typeof val.valueOf() === 'string' && datasets[ val ]) {  // entry is an alias
      val = datasets[ val ];
    }

    if(val.path) {

      const file = `${config.datapath}/${val.path}`;

      if (fs.existsSync(file)) {

        const dataset = gpicker.openFile(file, def.band, def.epsg)
            , meta = dataset.info()
            , {size} = fs.statSync(file)

        listDatasets[ key ] = {
          //path: val.path,
          size,
          epsg: val.epsg,
          band: val.band || 1,
          ...meta
        }
        if (key !== 'default') {
          dataset.close();
        }
      }
      else {
        fastify.log.warn(`Dataset not exists! ${file} `)
      }
    }

  }

  fastify.decorate('datasets', listDatasets);

  if (!fs.existsSync(datapath)) {
    throw config.errors.nodatadir
  }

  if (fs.existsSync(defaultFile)) {

    const defaultDataset = gpicker.openFile(defaultFile, def.band, def.epsg);

    fastify.log.info(`Default dataset loaded: ${defaultFile}`);

    fastify.decorate('defaultDataset', defaultDataset );
  }
  else {
    fastify.status = config.errors.nodefaultdataset;
    fastify.log.warn(config.errors.nodefaultdataset);
  }
});