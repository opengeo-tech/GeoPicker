/*
  manage dataset define in config.yml
 */
const fs = require('fs')
    , fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker, errors} = fastify
      , {datapath, datasets} = config

  if (!fs.existsSync(datapath)) {
    throw errors.nodatadir
  }

  if (!datasets || !datasets.default) {
    throw errors.nodatasets;
  }

  // eslint-disable-next-line
  const def = datasets[ datasets.default ] // (datasets.default && typeof datasets.default.valueOf()==='string') ?
      , defaultFile = `${datapath}/${def.path}`
      , listDatasets = {};

  for (let [key, val] of Object.entries(datasets)) {

    if (val != null && typeof val.valueOf() === 'string' && datasets[ val ]) {  // entry is an alias
      val = datasets[ val ];
    }

    if(val.path) {

      const file = `${datapath}/${val.path}`;

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
      }
      else {
        fastify.log.warn(`Dataset not exists! ${key} ${file} `);
        //remove from config if not exists
        delete datasets[key];
      }
    }
  }

  if (Object.keys(listDatasets).length===0) {
    throw errors.nodatasets;
  }

  // eslint-disable-next-line
  const datasetsNames = Object.keys(listDatasets)

  fastify.decorate('datasets', listDatasets);
  fastify.decorate('datasetsNames', datasetsNames);

  fastify.log.info(`Datasets available: ${datasetsNames}`);

  if (fs.existsSync(defaultFile)) {

    const defaultDataset = gpicker.openFile(defaultFile, def.band, def.epsg);

    fastify.decorate('defaultDataset', defaultDataset );
    fastify.log.info(`Dataset default loaded: ${defaultFile}`);
  }
  else {
    fastify.status = errors.nodefaultdataset;
    fastify.log.warn(errors.nodefaultdataset);
  }
});