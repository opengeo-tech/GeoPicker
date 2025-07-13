/*
 * GeoPicker-cli
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */

// TODO lib for options

//includi gestione parametri cli


const fs = require('fs')
  , { program } = require('commander')
  , { Console } = require('console')
  , geopicker = require('../lib/geopicker');


module.exports = process => {
  
  const console = new Console(process.stderr)
      , { setValue, getValue, utils: { parseLocations } } = geopicker;

  program
    .option('-g, --get <lonlat>', `pick only values from dataset by "lon,lat" param`)
    .option('-s, --set', 'set properties in the input geojson picking values from dataset')
    .requiredOption('-d, --dataset <file>', 'input dataset file like a raster .tif')
    .option('-i, --input-file <file>', 'input geojson file')
    .option('-t, --timing', 'print processing time', false)
    .option('-v, --verbose', 'print verbose output', false)


  if (process.argv.length <= 2) {
    program.help();
  }

  program.parse(process.argv);

  const {dataset, inputFile, timing, get, set, verbose} = program.opts();

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
}