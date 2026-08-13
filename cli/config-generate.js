const fs = require('fs')
    , path = require('path')
    , readline = require('readline')
    , yaml = require('js-yaml')
    , S = require('fluent-json-schema')
    , configSchema = require('../server/schemas/config')(S)
    , parserConfig = require('../server/parserConfig');

const SCANDIR_TYPES = ['.tif', '.tiff'];

// TODO move strings on schemas/config.js
const SETTINGS = {
    'datapath': 'datapath, base directory of the dataset files (TAB to autocomplete)'
  , 'datasets': 'datasets, folder to scan for dataset files (TAB to autocomplete)'
  , 'datasets.default': 'datasets default id'
  , 'port': 'port, TCP port the server listens on'
  , 'host': 'host, address the server listens on'
  , 'prefix': 'prefix, url prefix of all endpoints'
  , 'demopage.enabled': 'demopage, enable the demo map front-end'
  , 'demopage.url': 'demopage url'
  , 'fastifyConf.logger.level': 'fastifyConf logger level (trace/debug/info/warn/error/fatal)'
  , 'verbose': 'verbose, log debugging informations at startup'
  , 'validation': 'validation, validate input by json-schemas'
  , 'swagger.enabled': 'swagger, enable the interactive documentation front-end'
  , 'cors.enabled': 'cors, enable cross-origin resource sharing'
  , 'cors.origin': 'cors origin'
  , 'compress.enabled': 'compress, enable output compression'
  , 'status.config': 'status, show base configs in /status endpoint'
  , 'status.stats': 'status, show usage stats in /status endpoint'
  , 'maxLocations': 'maxLocations, maximum number of locations in a single request'
  , 'sepLocs': 'sepLocs, separator between locations'
  , 'sepCoords': 'sepCoords, separator between coordinates'
  , 'precision': 'precision, digits of returned coordinates (input/false/number)'
  , 'densify': 'densify, densification distance in meters (input/false/number)'
  , 'simplify': 'simplify, simplification factor 0 to 1 (input/false/number)'
  , 'formats': 'formats, allowed output formats (comma separated)'
};

function parseBool(val) {
  return ['y', 'yes', 'true', '1', 'on'].includes(String(val).trim().toLowerCase())
}

function parseMixed(val) {
  if (val === 'false') {
    return false
  }
  const num = Number(val)
  return Number.isNaN(num) ? val : num
}

function dirCompleter(line) {
  const slashIdx = line.lastIndexOf('/')
      , dirTyped = slashIdx >= 0 ? line.slice(0, slashIdx + 1) : ''
      , partial = slashIdx >= 0 ? line.slice(slashIdx + 1) : line;

  let names = []
  try {
    names = fs.readdirSync(dirTyped || '.').filter(name => {
      try {
        return fs.statSync(path.join(dirTyped || '.', name)).isDirectory()
      } catch (e) {
        return false
      }
    })
  } catch (e) {
    names = []
  }

  const hits = names.filter(name => name.startsWith(partial)).map(name => dirTyped + name + '/')
  return [hits, line]
}

module.exports = async (file, process, console, opts = {}) => {

  const {yes} = opts;

  let completePaths = false;

  const rl = yes ? null : readline.createInterface({
        input: process.stdin
      , output: process.stderr
      , completer: line => completePaths ? dirCompleter(line) : [[], line]
      })
      , defaultsPath = process.env.CONFIG || path.join(__dirname, '../server/config.yml')
      , defaults = parserConfig.load({basepath: path.dirname(defaultsPath), configfile: path.basename(defaultsPath)})
      , outPath = file ? path.resolve(file) : null;

  const queued = [];
  let waiting = null
    , ended = false;

  if (rl) {
    rl.on('line', line => {
      if (waiting) {
        const resolve = waiting;
        waiting = null;
        resolve(line);
      }
      else {
        queued.push(line);
      }
    });

    rl.on('close', () => {
      ended = true;
      if (waiting) {
        const resolve = waiting;
        waiting = null;
        resolve('');
      }
    });
  }

  function question(text) {
    rl.setPrompt(text);
    rl.prompt();
    if (queued.length > 0) {
      return Promise.resolve(queued.shift())
    }
    if (ended) {
      return Promise.resolve('')
    }
    return new Promise(resolve => { waiting = resolve })
  }

  async function ask(label, def, parse) {
    if (yes) {
      return def
    }
    const answer = (await question(`${label} [${def}]: `)).trim()
    if (answer === '') {
      return def
    }
    return parse ? parse(answer) : answer
  }

  async function askBool(label, def) {
    if (yes) {
      return def
    }
    const answer = (await question(`${label} (y/n) [${def ? 'y' : 'n'}]: `)).trim()
    return answer === '' ? def : parseBool(answer)
  }

  async function askNum(label, def) {
    if (yes) {
      return def
    }
    const answer = (await question(`${label} [${def}]: `)).trim()
        , num = Number(answer)
    return answer === '' || Number.isNaN(num) ? def : num
  }

  async function askPath(label, def) {
    completePaths = true;
    const answer = await ask(label, def)
    completePaths = false;
    return answer
  }

  console.log(yes
    ? 'GeoPicker config generator, keeping all the default values'
    : 'GeoPicker config generator, press ENTER to accept the [default] values');

  if (outPath && fs.existsSync(outPath)) {
    const overwrite = yes || await askBool(`${outPath} already exists, overwrite`, false)
    if (!overwrite) {
      rl.close();
      console.error('aborted');
      process.exit(1);
    }
  }

  const config = {};

  config.datapath = opts.datapath || await askPath(SETTINGS.datapath, defaults.datapath);

  const scanDir = await askPath(SETTINGS.datasets, config.datapath)
      , foundFiles = fs.existsSync(scanDir)
        ? fs.readdirSync(scanDir).filter(f => SCANDIR_TYPES.includes(path.extname(f).toLowerCase())).sort()
        : [];

  config.datasets = {};

  if (foundFiles.length === 0) {
    console.log(`no dataset files found in ${scanDir}`);
  }
  else {
    console.log(`found ${foundFiles.length} dataset files in ${scanDir}:\n` + foundFiles.map(f => `  ${f}`).join('\n'));
    for (const f of foundFiles) {
      const id = path.basename(f, path.extname(f));
      if (await askBool(`add dataset "${id}" (${f})`, true)) {
        config.datasets[id] = {path: f, band: 1};
      }
    }
  }

  if (opts.default) {
    const defaultFile = path.basename(opts.default)
        , found = Object.keys(config.datasets).find(id => config.datasets[id].path === defaultFile);

    if (!found) {
      console.error(`the default dataset file "${defaultFile}" is not among the generated datasets`);
      process.exit(1);
    }
    config.datasets.default = found;
  }
  else {
    config.datasets.default = await ask(SETTINGS['datasets.default'], Object.keys(config.datasets)[0] || '');

    if (config.datasets.default && !config.datasets[config.datasets.default]) {
      console.error(`the default dataset "${config.datasets.default}" is not among the generated datasets`);
      process.exit(1);
    }
  }

  console.log('resulting datasets config:\n' + yaml.dump({datasets: config.datasets}));

  config.port = opts.port ? Number(opts.port) : await askNum(SETTINGS.port, defaults.port);

  config.host = await ask(SETTINGS.host, defaults.host);
  config.prefix = await ask(SETTINGS.prefix, defaults.prefix);

  config.demopage = {...defaults.demopage};
  config.demopage.enabled = await askBool(SETTINGS['demopage.enabled'], defaults.demopage.enabled);
  if (config.demopage.enabled) {
    config.demopage.url = await ask(SETTINGS['demopage.url'], defaults.demopage.url);
  }

  config.attribution = defaults.attribution;

  config.fastifyConf = defaults.fastifyConf;
  if (config.fastifyConf.logger) {
    config.fastifyConf.logger.level = await ask(SETTINGS['fastifyConf.logger.level'], config.fastifyConf.logger.level);
  }

  config.verbose = await askBool(SETTINGS.verbose, defaults.verbose);
  config.validation = await askBool(SETTINGS.validation, defaults.validation);

  config.swagger = {...defaults.swagger};
  config.swagger.enabled = await askBool(SETTINGS['swagger.enabled'], defaults.swagger.enabled);

  config.cors = {...defaults.cors};
  config.cors.enabled = await askBool(SETTINGS['cors.enabled'], defaults.cors.enabled);
  if (config.cors.enabled) {
    config.cors.origin = await ask(SETTINGS['cors.origin'], defaults.cors.origin);
  }

  config.compress = {...defaults.compress};
  config.compress.enabled = await askBool(SETTINGS['compress.enabled'], defaults.compress.enabled);

  config.status = {...defaults.status};
  config.status.config = await askBool(SETTINGS['status.config'], defaults.status.config);
  config.status.stats = await askBool(SETTINGS['status.stats'], defaults.status.stats);

  config.maxLocations = await askNum(SETTINGS.maxLocations, defaults.maxLocations);
  config.sepLocs = await ask(SETTINGS.sepLocs, defaults.sepLocs);
  config.sepCoords = await ask(SETTINGS.sepCoords, defaults.sepCoords);

  config.precision = await ask(SETTINGS.precision, defaults.precision, parseMixed);
  config.densify = await ask(SETTINGS.densify, defaults.densify, parseMixed);
  config.simplify = await ask(SETTINGS.simplify, defaults.simplify, parseMixed);

  const fmts = await ask(SETTINGS.formats, defaults.formats.join(','));
  config.formats = String(fmts).split(',').map(s => s.trim()).filter(Boolean);

  if (rl) {
    rl.close();
  }

  const {port, host, datapath, datasets, ...others} = config
      , text = `##
## GeoPicker config file
## generated by the command "geopicker config-generate"
## at ${new Date().toISOString()}
##

` + yaml.dump({port, host, datapath, ...others, datasets});

  const {valid, errors} = parserConfig.validateConfig(yaml.load(text), configSchema.valueOf());

  if (!valid) {
    console.error('generated config is invalid:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log(outPath ? `generated config ${outPath} is valid` : 'generated config is valid');

  if (outPath) {
    fs.writeFileSync(outPath, text);
    console.log(`${outPath} generated`);
  }
  else {
    process.stdout.write(text);
  }
}
