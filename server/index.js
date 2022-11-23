
const fs = require('fs')
	, path = require('path')
	, Fastify = require('fastify')
	, cors = require('@fastify/cors')
	, autoload = require('@fastify/autoload')
	, dotenv = require('dotenv').config()
	, configyml = require('@stefcud/configyml')
	, pino = require('pino')
	, _ = require('lodash');

const {setElevation, getElevation, densify, gdal} = require('../lib');

const {name, version} = require(`${__dirname}/package.json`);

const config = configyml({basepath: __dirname})
		, {port, host, logger} = config;

const {listRoutes, datasets} = require('./utils')(config);

//TODO check geotiffs paths
var status = 'OK';

//TODO funch mapping raster id by config converto to file paths

if (!fs.existsSync(config.datapath)) {
  status = config.errors.nodatadir;
  console.warn(status)
}

const fastify = Fastify({
	logger
});

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

fastify.register(autoload, {
	dir: path.join(__dirname, 'routes')
});

fastify.get('/', async (req,res) => {
	return {
		status,
		name,
		version,
		gdal: gdal.version,
		datasets
	}
});

fastify.listen({port, host}, err => {
	if (err) {
		fastify.log.error(err);
		process.exit(1)
	}
});