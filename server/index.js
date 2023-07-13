/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const basepath = __dirname
    , {resolve} = require('path')
    , configYml = require('@stefcud/configyml')
    , Fastify = require('fastify')
    , gpicker = require('../lib')
    , package = require(resolve(`${basepath}/../package.json`))
    , config = configYml({basepath})
    , {fastifyConf, port, host, prefix, swagger} = config
    , fastify = Fastify(fastifyConf);

fastify.log.debug(config);

/**
 * fastify decorators
 */
fastify.decorate('package', package);
fastify.decorate('gpicker', gpicker);
fastify.decorate('config',  config);
fastify.decorate('status', 'OK');

/**
 * fastify Plugins configs and utils
 */
fastify.register(require('./plugins/datasets'));
fastify.register(require('./plugins/schemas'));
fastify.register(require('./plugins/valid'));
fastify.register(require('./plugins/print-routes'));

/**
 * 3rd fastify plugins
 */
fastify.register(require('@fastify/cors'), () => config.cors);
if (swagger.enabled === true) {
    fastify.register(require('./plugins/swagger'));
}

/**
 * fastify Routes
 */
if (config.demo_page === true) {
    fastify.register(require('./routes/demo'), {prefix});
}
fastify.register(require('./routes/status'), {prefix});
fastify.register(require('./routes/datasets'), {prefix});
fastify.register(require('./routes/lonlat'), {prefix});
fastify.register(require('./routes/locations'), {prefix});
fastify.register(require('./routes/geometry'), {prefix});

fastify.log.info(`Geopicker v${package.version} started`);

fastify.listen({port, host}, err => {
    if (err) {
        fastify.log.error(err);
        process.exit(1)
    }
});
