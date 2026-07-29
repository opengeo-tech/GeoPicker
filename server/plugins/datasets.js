/**
 * generate fastify.datasets decorators
 * and check datasets defined in config.yml
 */
const fs = require('fs')
    , fp = require('fastify-plugin');

module.exports = fp(async fastify => {

  const {config, gpicker, errors} = fastify
      , {datapath, datasets: configDatasets} = config

  if (!fs.existsSync(datapath)) {
    fastify.log.error(errors.nodatadir.message);
    //throw errors.nodatadir
  }

  if (!configDatasets || !configDatasets.default) {
    fastify.log.error(errors.nodatasets.message);
    //throw errors.nodatasets;
  }

  // eslint-disable-next-line
  const def = configDatasets[ configDatasets.default ] // (configDatasets.default && typeof configDatasets.default.valueOf()==='string') ?
      , defaultFile = `${datapath}/${def.path}`
      , datasets = {}
      , openDatasets = {}; // open dataset handles (gdal.Dataset) for each unique dataset file and band

  //TODO in the future there could be a mechanism for automatically closing openDatasets after a certain time limit has expired

  for (let [id, val] of Object.entries(configDatasets)) {

    const isAlias = val != null && typeof val.valueOf() === 'string' && !!configDatasets[ val ];

    if (isAlias) {  // entry is an alias
      val = configDatasets[ val ];
    }

    if(val.path) {

      const file = `${datapath}/${val.path}`;

      if (fs.existsSync(file)) {

        const key = `${val.path}:${val.band || 1}`
            , handle = openDatasets[ key ] || (openDatasets[ key ] = gpicker.openFile(file, val.band))
            , {info} = handle
            , isDefault = (id === 'default' || id === configDatasets.default);

        datasets[ id ] = {
          id,
          isDefault,
          isAlias,
          ...info,
          ...handle //not esposed in API, but available in fastify.openDatasets
        }
      }
      else {
        fastify.log.warn(`Dataset not exists! ${id} ${file} `);
        //remove from config if not exists
        delete configDatasets[id];
      }
    }
  }

  if (Object.keys(datasets).length===0) {
    fastify.log.error(errors.nodatasets.message);
    //throw errors.nodatasets;
  }

  // collecting all datasets and aliases that exist by config.yml in fastify decorators
  fastify.decorate('datasets', datasets);
  // collecting all open dataset handles (gdal.Dataset) for each unique dataset file and band in fastify decorators
  fastify.decorate('openDatasets', openDatasets);

  fastify.log.info(`Datasets available: ${Object.keys(datasets).join(', ')}`);

  // eslint-disable-next-line
  const datasetDefault = datasets[ configDatasets.default ]

  if (datasetDefault) {
    fastify.log.info(`Dataset default loaded: ${defaultFile}`);
  }
  else {
    fastify.status = errors.nodatasetdefault.message;
    fastify.log.warn(errors.nodatasetdefault.message);
  }
});
