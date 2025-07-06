/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const basepath = __dirname
    , config = require('./parserConfig')({basepath})
    , gpicker = require('../lib/geopicker')
    , Fastify = require('fastify')
    , {utils, package} = gpicker
    , {fastifyConf, port, host, prefix} = config
    , {cors, compress, swagger, demopage, verbose} = config;

// eslint-disable-next-line
const fastify = Fastify(fastifyConf);

/**
 * Decorators
 */
fastify.decorate('config',  config);
fastify.decorate('gpicker', gpicker);
fastify.decorate('package', package);
fastify.decorate('utils',   utils);
fastify.decorate('status', 'OK');

/**
 * Base Plugins
 */
fastify.register(require('./plugins/errors'));
fastify.register(require('./plugins/datasets'));
fastify.register(require('./plugins/schema'));
fastify.register(require('./plugins/validation'));
fastify.register(require('./plugins/dataparser'));
fastify.register(require('./plugins/densify'));
fastify.register(require('./plugins/simplify'));
fastify.register(require('./plugins/precision'));
fastify.register(require('./plugins/format'));

/**
 * Optional Plugins
 */
if (cors.enabled) {
    fastify.register(require('@fastify/cors'), () => cors);
}
/**
 * Enable compression (gzip, deflate) for responses
 */
if (compress.enabled) {
    fastify.register(require('@fastify/compress'), compress);
}
/**
 * Enable Swagger by `@fastify/swagger` and front-end by `@fastify/swagger-ui`
 */
if (swagger.enabled) {
    fastify.register(require('./plugins/swagger'), {prefix});
}
/**
 * Enable demo page(index.html) in path defined by `config.demopage.path` url(default: root path)
 */
if (demopage.enabled) {
    fastify.register(require('./routes/demopage'), {prefix});
}
/**
 * show configuration informations and endpoints at startup (enabled in development mode)
 */
if (verbose) {
    fastify.register(require('./plugins/verbose'));
}

/**
 * API Routes
 */
fastify.register(require('./routes/status'),   {prefix});
fastify.register(require('./routes/datasets'), {prefix});
fastify.register(require('./routes/lonlat'),   {prefix});
fastify.register(require('./routes/locations'),{prefix});
fastify.register(require('./routes/geometry'), {prefix});
fastify.register(require('./routes/metadata'), {prefix});

fastify.log.info(`Geopicker v${package.version} started...`);

fastify.listen({port, host}, err => {
    if (err) {
        fastify.log.error(err);
        process.exit(1)
    }
});
