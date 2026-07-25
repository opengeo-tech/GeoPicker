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
      , listDatasets = {}
      , datasetHandles = {};

  for (let [id, val] of Object.entries(datasets)) {

    if (val != null && typeof val.valueOf() === 'string' && datasets[ val ]) {  // entry is an alias
      val = datasets[ val ];
    }

    if(val.path) {

      const file = `${datapath}/${val.path}`;

      if (fs.existsSync(file)) {

        const handle = gpicker.openFile(file, val.band)
            , {info} = handle
            , isDefault = (id === 'default' || id === datasets.default);

        listDatasets[ id ] = {
          id,
          isDefault,
          ...info
        }
        datasetHandles[ id ] = handle;
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
  fastify.decorate('datasetHandles', datasetHandles);

  fastify.log.info(`Datasets available: ${datasetsIds}`);

  // eslint-disable-next-line
  const datasetDefault = datasetHandles[ datasets.default ]

  if (datasetDefault) {
    fastify.log.info(`Dataset default loaded: ${defaultFile}`);
  }
  else {
    fastify.status = errors.nodatasetdefault.message;
    fastify.log.warn(errors.nodatasetdefault.message);
  }
});