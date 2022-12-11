/*
  manage dataset define in config.yml
 */
const fs = require('fs')
    , fp = require('fastify-plugin')
    /*, reserved = [
      'default',
      'dataset',
      'meta',
    ];*/

module.exports = fp(async fastify => {

  const {config, gpicker} = fastify
      , {datapath, datasets} = config
      , def = datasets[ datasets.default ] // (datasets.default && typeof datasets.default.valueOf()==='string') ?
      , defaultFile = `${datapath}/${def.path}`

  /**
   * listing available datasets and resolves the aliases
   * @param  {[type]} config [description]
   * @return {[Object]}        [description]
   */
  function listDatasets(config) {

    const list = {
      default: config.datasets[ config.datasets.default ]
    };

    for (let [key, val] of Object.entries(config.datasets)) {

      // entry is an alias
      if (val != null && typeof val.valueOf() === 'string' && config.datasets[ val ]) {
        val = config.datasets[ val ];
      }

      if(val.path) {

        const file = `${config.datapath}/${val.path}`;

        if (fs.existsSync(file)) {

          const dataset = gpicker.openFile(file, def.band, def.epsg)
              , meta = dataset.info()
              , {size} = fs.statSync(file)

          list[ key ] = {
            path: val.path,
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
    // TODO decore with bands of each raster and fields of each shapes

    return list;
  }

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

  fastify.decorate('datasets', listDatasets(config));
});