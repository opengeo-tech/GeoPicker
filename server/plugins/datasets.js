/**
 * generate fastify.datasets decorators
 * and check datasets defined in config.yml
 */
const fs = require('fs')
    , fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker, errors} = fastify
      , {datapath, datasets} = config

  if (!fs.existsSync(datapath)) {
    fastify.log.error(errors.nodatadir.message);
    //throw errors.nodatadir
  }

  if (!datasets || !datasets.default) {
    fastify.log.error(errors.nodatasets.message);
    //throw errors.nodatasets;
  }

  // eslint-disable-next-line
  const def = datasets[ datasets.default ] // (datasets.default && typeof datasets.default.valueOf()==='string') ?
      , defaultFile = `${datapath}/${def.path}`
      , listDatasets = {};

  for (let [id, val] of Object.entries(datasets)) {

    if (val != null && typeof val.valueOf() === 'string' && datasets[ val ]) {  // entry is an alias
      val = datasets[ val ];
    }

    if(val.path) {

      const file = `${datapath}/${val.path}`;

      if (fs.existsSync(file)) {

        const dataset = gpicker.openFile(file, val.band)
            , isDefault = (id === 'default' || id === datasets.default);

        listDatasets[ id ] = {
          id,
          isDefault,
          ...dataset.info
        }
      }
      else {
        fastify.log.warn(`Dataset not exists! ${id} ${file} `);
        //remove from config if not exists
        delete datasets[id];
      }
    }
  }

  if (Object.keys(listDatasets).length===0) {
    fastify.log.error(errors.nodatasets.message);
    //throw errors.nodatasets;
  }

  // eslint-disable-next-line
  const datasetsIds = Object.keys(listDatasets)

  fastify.decorate('datasets', listDatasets);
  fastify.decorate('datasetsIds', datasetsIds);

  fastify.log.info(`Datasets available: ${datasetsIds}`);

  if (fs.existsSync(defaultFile)) {

    const datasetDefault = gpicker.openFile(defaultFile, def.band, def.epsg);

    fastify.decorate('datasetDefault', datasetDefault );
    fastify.log.info(`Dataset default loaded: ${defaultFile}`);
  }
  else {
    fastify.status = errors.nodatasetdefault.message;
    fastify.log.warn(errors.nodatasetdefault.message);
  }
});