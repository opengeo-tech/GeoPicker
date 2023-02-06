/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const configYml = require('@stefcud/configyml')
    , Fastify = require('fastify')
    , gpicker = require('../lib')
    , config = configYml({
        basepath: __dirname,
        defaultsEnv: {
          DEMO_PAGE: false,
          PREFIX: '/'
        }
      })
    , {fastifyConf, port, host, prefix} = config
    , fastify = Fastify(fastifyConf);

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
fastify.register(require('./routes/root'), {prefix});
fastify.register(require('./routes/lonlat'), {prefix});
fastify.register(require('./routes/datasets'), {prefix});
fastify.register(require('./routes/geometry'), {prefix});
fastify.register(require('./routes/locations'), {prefix});

/**
 * demo page map
 */
if (config.demopage===true) {
    fastify.register(require('./routes/demo'), {prefix});
}

fastify.listen({port, host}, err => {
    if (err) {
        fastify.log.error(err);
        process.exit(1)
    }
});
