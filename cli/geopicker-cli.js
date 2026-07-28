/*
 * GeoPicker-cli
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */

const path = require('path')
    , { program } = require('commander');

function loadAndValidateConfig(file) {
  const parserConfig = require('../server/parserConfig')
      , configPath = file || path.join(__dirname, '../server/config.yml')
      , basepath = path.dirname(configPath)
      , configfile = path.basename(configPath);

  const config = parserConfig.load({basepath, configfile});
  parserConfig.validateConfig(config, './schemas/config');

  return {config, configPath};
}

module.exports = process => {

  const { Console } = require('console')
      , console = new Console(process.stderr);

  program
    .command('validate-config [file]')
    .description('validate a config.yml file against the GeoPicker config schema')
    .action(file => {
      try {
        const {configPath} = loadAndValidateConfig(file);
        console.log(`${configPath} valido`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  program
    .command('show-config [file]')
    .description('print the parsed config.yml object as JSON')
    .action(file => {
      try {
        const {config} = loadAndValidateConfig(file);
        console.log(JSON.stringify(config, null, 2));
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  program
    .command('start-server')
    .description('start the GeoPicker HTTP server')
    .action(() => {
      require('../server/server.js');
    });

  //TODO command status-server

  program
    .option('-g, --get <lon,lat>', `pick only values from dataset by longitude and latitude param`)
    .option('-s, --set', 'set properties in the input geojson picking values from dataset')
    .option('-d, --dataset <file>', 'input dataset file like a raster .tif')
    .option('-i, --input-file <file>', 'input geojson file')
    .option('-t, --timing', 'print processing time', false)
    .option('-v, --verbose', 'print verbose output', false)
    .action(opts => {
      if (!opts.dataset) {
        program.error("error: required option '-d, --dataset <file>' not specified");
      }

      const fs = require('fs')
          , geopicker = require('../lib/geopicker')
          , { setValue, getValue, utils: { parseLocations } } = geopicker;

      const {dataset, inputFile, timing, get, set, verbose} = opts;

      if(timing)  {
        console.time('Processing');
      }

      const inputGeojson = inputFile ? JSON.parse(fs.readFileSync(inputFile,'utf-8')) : null;

      if(verbose) {
        process.stdout.write(('Input:\n'+ JSON.stringify(inputGeojson, null, 4))+'\n');
        process.stdout.write('Output:\n');
      }

      if(set && inputGeojson) {
        setValue(inputGeojson, dataset);
        process.stdout.write(JSON.stringify(inputGeojson,null,4));
      }
      else if(get) {
        const locs = parseLocations(get,'_');
        const values = getValue(locs, dataset);
        process.stdout.write(JSON.stringify(values,null,4)+'\n');
      }

      if(timing)  {
        console.timeEnd('Processing');
      }
    });

  if (process.argv.length <= 2) {
    program.help();
  }

  program.parse(process.argv);
}
