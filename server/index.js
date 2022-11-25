
const fs = require('fs')
	, path = require('path')
	, Fastify = require('fastify')
	, cors = require('@fastify/cors')
	, autoload = require('@fastify/autoload')
	, dotenv = require('dotenv').config()
	, configyml = require('@stefcud/configyml')
	, pino = require('pino')
	, _ = require('lodash');

const gp = require('../lib')
	, {openFile, gdal} = gp;

const {name, version} = require(`${__dirname}/package.json`);

const config = configyml({basepath: __dirname})
	, {port, host, logger} = config;

const utils = require('./plugins/utils')
	, {listRoutes, listDatasets} = utils;

//TODO check geotiffs paths
var status = 'OK';

//TODO funch mapping raster id by config converto to file paths
const fastify = Fastify({
	logger
});

if (!fs.existsSync(config.datapath)) {
  status = config.errors.nodatadir;
  throw status
}

const def = config.datasets[ config.default_dataset ]
	, defaultFile = `${config.datapath}/${def.path}`

if (fs.existsSync(defaultFile)) {
	fastify.decorate('defaultDataset', openFile(defaultFile, def.band, def.epsg) );
	console.log(`Default dataset loaded: ${defaultFile}`)
	console.log(JSON.stringify(fastify.defaultDataset.info(),null,4));
}
else {
  status = config.errors.nodefaultdataset;
  console.warn(status);
}

//TODO make fasty plugin of
const routes = [];
fastify
.addHook('onRoute', route => {
    routes.push(route)
})
.addHook('onReady', async () => {
	console.log('config:', JSON.stringify(config,null,4));
    console.log('routes:', listRoutes(routes));
    console.log(`${name} ${version} listening at http://${host}:${port}`);
});

fastify.register(cors, () => {
    return (req, cb) => {
        cb(null, config.cors);
    }
});

fastify.decorate('gp', gp);
fastify.decorate('config', config);
fastify.decorate('utils', utils);

fastify.register(autoload, {
	dir: path.join(__dirname, 'routes')
});

fastify.get('/', async (req,res) => {
	return {
		status,
		name,
		version,
		gdal: gdal.version,
		datasets: listDatasets(config)
	}
});

fastify.listen({port, host}, err => {
	if (err) {
		fastify.log.error(err);
		process.exit(1)
	}
});