
const fs = require('fs')
		, path = require('path')
		, Fastify = require('fastify')
		, cors = require('@fastify/cors')
		, autoload = require('@fastify/autoload')
    , dotenv = require('dotenv').config()
    , configyml = require('@stefcud/configyml')
		, pino = require('pino');

const {setElevation, getElevation, densify, gdal} = require('../lib');

const {name, version} = require(`${__dirname}/package.json`);

const {listRoutes} = require('./utils');

const config = configyml({basepath: __dirname})
		, {port, host, logger} = config;

//TODO check geotiffs paths
var status = 'OK';

const defaultRaster = `${config.datapath}${config.rasters.default.path}`;

//TODO funch mapping raster id by config converto to file paths

if (!fs.existsSync(config.datapath)) {
  status = config.errors.nodatadir;
  console.warn(status)
}

const fastify = Fastify({
	logger
});


const routes = [];
fastify
.addHook('onRoute', route => {
    routes.push(route)
})
.addHook('onReady', async () => {
		console.log('config:', JSON.stringify(config));
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
		gdal: gdal.version
	}
});

fastify.listen({port, host}, err => {
	if (err) {
		fastify.log.error(err);
		process.exit(1)
	}
});