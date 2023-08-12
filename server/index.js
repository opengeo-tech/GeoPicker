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
    , {fastifyConf, port, host, prefix, cors, compress, swagger, demopage} = config
    , fastify = Fastify(fastifyConf);

fastify.log.debug(config);

/**
 * Decorators
 */
fastify.decorate('package', package);
fastify.decorate('gpicker', gpicker);
fastify.decorate('config',  config);
fastify.decorate('status', 'OK');

/**
 * Base Plugins configs and utils
 */
fastify.register(require('./plugins/datasets'));
fastify.register(require('./plugins/format'));
fastify.register(require('./plugins/schemas'));
fastify.register(require('./plugins/precision'));
fastify.register(require('./plugins/valid'));
fastify.register(require('./plugins/print-routes'));

/**
 * Optional Plugins
 */
if (cors.enabled) {
    fastify.register(require('@fastify/cors'), () => cors);
}
if (compress.enabled) {
    fastify.register(require('@fastify/compress'), compress);
}
if (swagger.enabled) {
    fastify.register(require('./plugins/swagger'));
}
if (demopage.enabled) {
    fastify.register(require('./routes/demo'), {prefix});
}

/**
 * Routes
 */
fastify.register(require('./routes/status'),   {prefix});
fastify.register(require('./routes/datasets'), {prefix});
fastify.register(require('./routes/lonlat'),   {prefix});
fastify.register(require('./routes/locations'),{prefix});
fastify.register(require('./routes/geometry'), {prefix});

fastify.log.info(`Geopicker v${package.version} started`);

fastify.listen({port, host}, err => {
    if (err) {
        fastify.log.error(err);
        process.exit(1)
    }
});
