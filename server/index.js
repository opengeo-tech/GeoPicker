/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const config = require('@stefcud/configyml')({basepath: __dirname})
    , {port, host, fastifyConf} = config
    , fastify = require('fastify')(fastifyConf)
    , gpicker = require('../lib');

fastify.log.debug(config);

/**
 * fastify decorators
 */
fastify.decorate('package', require(`${__dirname}/package.json`));
fastify.decorate('gpicker', gpicker);
fastify.decorate('config', config);
fastify.decorate('status', 'OK');

/**
 * 3rd fastify plugins
 */
fastify.register(require('@fastify/cors'), () => config.cors);

/**
 * fastify Plugins configs and utils
 */
fastify.register(require('./plugins/list-routes'));
fastify.register(require('./plugins/datasets'));
fastify.register(require('./plugins/schemas'));
fastify.register(require('./plugins/valid'));

/**
 * fastify Routes
 */
fastify.register(require('./routes/root'));
fastify.register(require('./routes/datasets'));
fastify.register(require('./routes/lonlat'));
fastify.register(require('./routes/geometry'));
fastify.register(require('./routes/locations'));

/**
 * demo page map
 */
if (config.demopage) {
    fastify.register(require('./routes/demo'));
}

fastify.listen({port, host}, err => {
    if (err) {
        fastify.log.error(err);
        process.exit(1)
    }
});
