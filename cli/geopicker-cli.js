/*
 * GeoPicker-cli
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */

const path = require('path')
    , { program } = require('commander')
    , fs = require('fs')
    , geopicker = require('../lib/geopicker')
    , server = require('../server/server.js')


module.exports = process => {

  const { Console } = require('console')
      , console = new Console(process.stderr);

  program
    .command('config-validate [file]')
    .description('validate a config.yml file against the GeoPicker config schema')
    .action(file => {
      try {
        const {configPath, valid, errors} = server.loadConfig(file);
        if (!valid) {
          console.error(errors.join('\n'));
          process.exit(1);
        }
        console.log(`${configPath} valido`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  program
    .command('config-show [file]')
    .description('print the parsed config.yml object as JSON')
    .action(file => {
      try {
        const {config, valid, errors} = server.loadConfig(file);
        if (!valid) {
          console.error(errors.join('\n'));
          process.exit(1);
        }
        console.log(JSON.stringify(config, null, 2));
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  program
    .command('config-generate [file]')
    .description('interactively generate a new config.yml file, print to stdout if file is omitted')
    .option('-p, --datapath <dir>', 'base directory of the dataset files, skips the datapath question')
    .option('-y, --yes', 'answer yes to all the questions keeping the default values, overwrite the file if exists')
    .option('-D, --default <file>', 'dataset file to set as default dataset, skips the datasets default id question')
    .option('-P, --port <port>', 'TCP port the server listens on, skips the port question')
    .action(async (file, opts) => {
      try {
        await require('./config-generate')(file, process, console, opts);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  program
    .command('server-start')
    .description('start the GeoPicker HTTP server with a config file, defaults to ./config.yml')
    .option('-c, --config <file>', 'config file path')
    .action(opts => {
      try {
        process.env.CONFIG = path.resolve(opts.config || process.env.CONFIG || './config.yml');
        server.start();
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  program
    .command('server-status')
    .description('show the status JSON of the running GeoPicker HTTP server (same as the /status endpoint)')
    .option('-c, --config <file>', 'config file path')
    .action(opts => {
      const {config, valid, errors} = server.loadConfig(opts.config && path.resolve(opts.config));

      if (!valid) {
        console.error(errors.join('\n'));
        process.exit(1);
      }

      const {port, host, prefix} = config
          , hostname = host === '0.0.0.0' ? '127.0.0.1' : host
          , url = `http://${hostname}:${port}${prefix.endsWith('/') ? prefix : prefix + '/'}status`;

      require('http').get(url, res => {
        let body = '';
        res.on('data', chunk => { body += chunk });
        res.on('end', () => process.stdout.write(JSON.stringify(JSON.parse(body), null, 4) + '\n'));
      }).on('error', e => {
        console.error(`server not reachable at ${url}: ${e.message}`);
        process.exit(1);
      });
    });

  program
    .command('bash-completion')
    .description('generate a bash completion script for the geopicker cli')
    .action(() => {
      require('./bash-completion')(program, process);
    });

  program
    .option('-g, --get <lon,lat>', `pick only values from dataset by longitude and latitude param`)
    .option('-s, --set', 'set properties in the input geojson picking values from dataset')
    .option('-d, --dataset <file>', 'input dataset file like a raster .tif')
    .option('-i, --input-file <file>', 'input geojson file')
    .option('-t, --timing', 'print processing time', false)
    .option('-v, --verbose', 'print verbose output', false)
    .option('-V, --version', 'print geopicker version', false)
    .action(opts => {
      if (opts.version) {
         process.stdout.write(`${geopicker.package.version}\n`);
        process.exit(0);
      }

      if (!opts.dataset) {
        program.error("error: required option '-d, --dataset <file>' not specified");
      }

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
        geopicker.setValue(inputGeojson, dataset);
        process.stdout.write(JSON.stringify(inputGeojson,null,4));
      }
      else if(get) {
        const locs = geopicker.utils.parseLocations(get,'_');
        const values = geopicker.getValue(locs, dataset);
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
