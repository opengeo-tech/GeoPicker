/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 */
const Fastify = require('fastify')
	//, polyline = require('@mapbox/polyline');
    , configYml = require('@stefcud/configyml')
    , config = configYml({basepath: __dirname})
    , {port, host, logger} = config
    , {name, version} = require(`${__dirname}/package.json`)
    , gpicker = require('../lib')
    , fastify = Fastify({logger});

fastify.decorate('gpicker', gpicker);
fastify.decorate('config', config);
fastify.decorate('status', 'OK');

fastify.register(require('@fastify/cors'), () => config.cors);

fastify.register(require('./plugins/datasets'));
fastify.register(require('./plugins/list-routes'));

fastify.register(require('./routes/index'), {
	// TODO use dataset in prefix: '/v1'
});

if (config.demopage) {
	fastify.register(require('./routes/demo'));
}

fastify.get('/', async () => {

	const {status, datasets, gpicker} = fastify;

	return {
		name,
		version,
		gdal: gpicker.gdal.version,
		status,
		datasets
	}
});

fastify.listen({port, host}, err => {

	fastify.log.info(JSON.stringify(config,null,4), 'config')

	if (err) {
		fastify.log.error(err);
		process.exit(1)
	}
});