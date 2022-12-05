
const fs = require('fs')
	, path = require('path')
	, Fastify = require('fastify')
	//, autoload = require('@fastify/autoload')
	//, dotenv = require('dotenv').config()
	, configYml = require('@stefcud/configyml')
	, pino = require('pino')
	, _ = require('lodash');

const gpicker = require('../lib')
	, {openFile, gdal} = gpicker;

const {name, version} = require(`${__dirname}/package.json`);

const config = configYml({basepath: __dirname})
	, {port, host, logger} = config;

const fastify = Fastify({
	logger
});

fastify.decorate('status', 'OK');
fastify.decorate('gpicker', gpicker);
fastify.decorate('config', config);

fastify.register(require('@fastify/cors'), () => config.cors);

fastify.register(require('./plugins/datasets'));
fastify.register(require('./plugins/list-routes'));

fastify.register(require('./routes/index'), {
	//TODO use dataset in prefix: '/v1'
});

if (config.demopage) {
	fastify.register(require('./routes/demo'));
}

fastify.get('/', async (req,res) => {

	const {status, datasets} = fastify;

	return {
		name,
		version,
		gdal: gdal.version,
		status,
		datasets
	}
});

fastify.listen({port, host}, err => {

	console.log('config:', JSON.stringify(config,null,4))

	if (err) {
		fastify.log.error(err);
		process.exit(1)
	}
});