const fs = require('fs')
    , path = require('path')
    , readline = require('readline')
    , yaml = require('js-yaml')
    , parserConfig = require('../server/parserConfig');

const SCANDIR_TYPES = ['.tif', '.tiff'];

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

module.exports = async (file, process, console) => {

  let completePaths = false;

  const rl = readline.createInterface({
        input: process.stdin
      , output: process.stderr
      , completer: line => completePaths ? dirCompleter(line) : [[], line]
      })
      , defaults = parserConfig.load({basepath: path.join(__dirname, '../server'), configfile: 'config.yml'})
      , outPath = file ? path.resolve(file) : null;

  const queued = [];
  let waiting = null
    , ended = false;

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
    const answer = (await question(`${label} [${def}]: `)).trim()
    if (answer === '') {
      return def
    }
    return parse ? parse(answer) : answer
  }

  async function askBool(label, def) {
    const answer = (await question(`${label} (y/n) [${def ? 'y' : 'n'}]: `)).trim()
    return answer === '' ? def : parseBool(answer)
  }

  async function askNum(label, def) {
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

  console.log('GeoPicker config generator, press ENTER to accept the [default] values');

  if (outPath && fs.existsSync(outPath)) {
    const overwrite = await askBool(`${outPath} already exists, overwrite`, false)
    if (!overwrite) {
      rl.close();
      console.error('aborted');
      process.exit(1);
    }
  }

  const config = {};

  config.datapath = await askPath('datapath, base directory of the dataset files (TAB to autocomplete)', defaults.datapath);

  const scanDir = await askPath('datasets, folder to scan for dataset files (TAB to autocomplete)', config.datapath)
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

  config.datasets.default = await ask('datasets default id', Object.keys(config.datasets)[0] || '');

  console.log('resulting datasets config:\n' + yaml.dump({datasets: config.datasets}));

  config.port = await askNum('port, TCP port the server listens on', defaults.port);
  config.host = await ask('host, address the server listens on', defaults.host);
  config.prefix = await ask('prefix, url prefix of all endpoints', defaults.prefix);

  config.demopage = {...defaults.demopage};
  config.demopage.enabled = await askBool('demopage, enable the demo map front-end', defaults.demopage.enabled);
  if (config.demopage.enabled) {
    config.demopage.url = await ask('demopage url', defaults.demopage.url);
  }

  config.attribution = defaults.attribution;

  config.fastifyConf = defaults.fastifyConf;
  if (config.fastifyConf.logger) {
    config.fastifyConf.logger.level = await ask('fastifyConf logger level (trace/debug/info/warn/error/fatal)', config.fastifyConf.logger.level);
  }

  config.verbose = await askBool('verbose, log debugging informations at startup', defaults.verbose);
  config.validation = await askBool('validation, validate input by json-schemas', defaults.validation);

  config.swagger = {...defaults.swagger};
  config.swagger.enabled = await askBool('swagger, enable the interactive documentation front-end', defaults.swagger.enabled);

  config.cors = {...defaults.cors};
  config.cors.enabled = await askBool('cors, enable cross-origin resource sharing', defaults.cors.enabled);
  if (config.cors.enabled) {
    config.cors.origin = await ask('cors origin', defaults.cors.origin);
  }

  config.compress = {...defaults.compress};
  config.compress.enabled = await askBool('compress, enable output compression', defaults.compress.enabled);

  config.status = {...defaults.status};
  config.status.config = await askBool('status, show base configs in /status endpoint', defaults.status.config);
  config.status.stats = await askBool('status, show usage stats in /status endpoint', defaults.status.stats);

  config.maxLocations = await askNum('maxLocations, maximum number of locations in a single request', defaults.maxLocations);
  config.sepLocs = await ask('sepLocs, separator between locations', defaults.sepLocs);
  config.sepCoords = await ask('sepCoords, separator between coordinates', defaults.sepCoords);

  config.precision = await ask('precision, digits of returned coordinates (input/false/number)', defaults.precision, parseMixed);
  config.densify = await ask('densify, densification distance in meters (input/false/number)', defaults.densify, parseMixed);
  config.simplify = await ask('simplify, simplification factor 0 to 1 (input/false/number)', defaults.simplify, parseMixed);

  const fmts = await ask('formats, allowed output formats (comma separated)', defaults.formats.join(','));
  config.formats = String(fmts).split(',').map(s => s.trim()).filter(Boolean);

  rl.close();

  const {port, host, datapath, datasets, ...others} = config
      , text = `##
## GeoPicker config file
## generated by the command "geopicker config-generate"
## at ${new Date().toISOString()}
##

` + yaml.dump({port, host, datapath, ...others, datasets});

  const {valid, errors} = parserConfig.validateConfig(yaml.load(text), './schemas/config');
  if (!valid) {
    console.error('generated config is invalid:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log(`generated config ${outPath} is valid`);

  if (outPath) {
    fs.writeFileSync(outPath, text);
    console.log(`${outPath} generated`);
  }
}
