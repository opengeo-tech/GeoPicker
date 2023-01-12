/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const config = require('@stefcud/configyml')({basepath: __dirname})
    , {port, host, fastifyConf} = config
    , gpicker = require('../lib')
    , fastify = require('fastify')(fastifyConf)
    // , S = require('fluent-json-schema')
    // , polyline = require('@mapbox/polyline')

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
 * fastify plugins configs and utils
 */
fastify.register(require('./plugins/datasets'));
fastify.register(require('./plugins/list-routes'));

/**
 * fastify routes
 */
fastify.register(require('./routes/root'));
fastify.register(require('./routes/lonlat'));
fastify.register(require('./routes/geometry'));
fastify.register(require('./routes/locations'));
if (config.demopage) {
    fastify.register(require('./routes/demo'));
}

fastify.listen({port, host}, err => {

    fastify.log.debug(JSON.stringify(config,null,4), 'config')

    if (err) {
        fastify.log.error(err);
        process.exit(1)
    }
});
