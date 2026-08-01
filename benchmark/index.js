
const path = require('path')
const { spawn } = require('child_process')
const autocannon = require('autocannon')
const parserConfig = require('../server/parserConfig')

// https://github.com/mcollina/autocannon#api
const BENCH_CONFIG = {
    duration: 10,   // The number of seconds to run the autocannon. default: 10.
    pipelining: 1,  // The number of pipelined requests for each connection. Will cause the Client API to throw when greater than 1. default: 1.
    connections: 8, // The number of concurrent connections to use. default: 10.
}
//const BENCH_DATASET = 'trentino-altoadige_dem_90m';
//const BENCH_DATASET = 'test_4611_dem';
const BENCH_DATASET = 'default';

const CONFIG_FILE = 'config.yml'
const CLI_BIN = path.join(__dirname, '../cli/bin/geopicker')
const BENCH_SERVER = process.env.BENCH_SERVER;

function locRandom(bbox = [[-90, -180], [90, 180]]) {
    const [[minLat, minLon], [maxLat, maxLon]] = bbox;
    return [
        minLon + (maxLon - minLon) * Math.random(),
        minLat + (maxLat - minLat) * Math.random()
    ];
}

function humanSize(bytes) {
    if (bytes === 0) return bytes;
    const sizes = ['Bytes','KB','MB','GB','TB']
        , i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 1) + ' ' + sizes[i];
}

/**
 * resolve the dataset file of an id, following the aliases of config.yml
 */
function datasetFile(config, id) {
  if (!config) {
    return null
  }
  const {datapath, datasets} = config

  let entry = datasets[id];

  if (typeof entry === 'string') {  // 'default' or an alias
    entry = datasets[entry];
  }
  return entry && entry.path ? path.join(datapath, entry.path) : null
}

/**
 * poll the /status endpoint until the spawned server answers, return its status
 */
async function waitServer(url, retries = 60) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`${url} responded ${res.status}`)
      }
      return await res.json()
    }
    catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw new Error(`server not reachable at ${url}`)
}

async function main() {

  let baseUrl
    , basePath
    , datasetId
    , instance
    , config = null
    , server = null;

  if (BENCH_SERVER) {
    const url = new URL(BENCH_SERVER.endsWith('/') ? BENCH_SERVER : BENCH_SERVER + '/');
    baseUrl = url.href;
    basePath = url.pathname;
    instance = `external ${baseUrl} ${url.origin}`;
  }
  else {
    config = parserConfig.load({basepath: __dirname, configfile: CONFIG_FILE});

    const {port, host, prefix} = config
        , hostname = host === '0.0.0.0' ? '127.0.0.1' : host;

    basePath = prefix.endsWith('/') ? prefix : prefix + '/';
    baseUrl = `http://${hostname}:${port}${basePath}`;

    // spawn the server in a child process
    server = spawn('node', [CLI_BIN, 'server-start', '-c', CONFIG_FILE], {
      cwd: __dirname,
      stdio: ['ignore', 'ignore', 'inherit']
    });
    instance = `spawned ${baseUrl}`;
  }

  try {

    // wait for the server to be ready
    const {version, gdal} = await waitServer(`${baseUrl}status`);

    datasetId = BENCH_DATASET ?? 'default';

    let res = await fetch(`${baseUrl}${datasetId}`);

    if (!res.ok) {
      throw new Error(`no dataset found: '${datasetId}' to benchmark on ${baseUrl}`)
    }

    const info = await res.json()
        , {bbox, dataType, epsg, width, height, pixelSize, stats} = info
        , {minLon, minLat, maxLon, maxLat} = bbox
        , bb = [[minLat, minLon], [maxLat, maxLon]]
        , file = datasetFile(config, datasetId);

    console.log([
      `date:     ${new Date().toISOString()}`
    , `instance: ${instance}`      
    , `version:  GeoPicker ${version} Gdal ${gdal}`
    , `dataset:  ${datasetId}`
    , `  file:   ${file ? ` ${file}` : ''}`
    , `  size:   ${humanSize(info.totalSize)}`
    , `  raster: ${width}x${height} ${dataType} epsg:${epsg}`
    , `  pixel:  ${pixelSize.avgInMeters || pixelSize.x} ${pixelSize.avgInMeters ? 'meters' : pixelSize.unit}`
    , `  stats:  min ${stats.min} max ${stats.max} mean ${stats.mean}`
    , `  bbox:   ${minLon} ${minLat} ${maxLon} ${maxLat}`
    ].join('\n'));

    // run the benchmark
    const result = await autocannon({
      url: baseUrl,
      ...BENCH_CONFIG,
      requests: [{
        setupRequest: function(request) {

          const [lon, lat] = locRandom(bb);

          request.path = `${basePath}${datasetId}/${lon}/${lat}`;

          return request
        }
      }]
    });

    console.log(autocannon.printResult(result, {}));
  }
  finally {
    if (server) {
      server.kill();
    }
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
})
