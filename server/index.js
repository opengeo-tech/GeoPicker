/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 */
const config = require('@stefcud/configyml')({basepath: __dirname})
    , {name, version} = require(`${__dirname}/package.json`)
    , {port, host, logger} = config
    , gpicker = require('../lib')
    , fastify = require('fastify')({logger})
    // , S = require('fluent-json-schema')
    // , polyline = require('@mapbox/polyline')

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

    const {status, gpicker} = fastify;

    return {
        name,
        version,
        gdal: gpicker.gdal.version,
        status
    }
});

fastify.get('/datasets', {
    /*schema: {
      description: 'List datasets available',
      response: {
        200: S.object()
            .patternProperties({
                '.*': S.object()
                .prop('path', S.string())
                .prop('band', S.integer())
                .prop('epsg', S.integer())
            })
      }
    }*/
}, async () => {
    return fastify.datasets;
});

fastify.listen({port, host}, err => {

    fastify.log.info(JSON.stringify(config,null,4), 'config')

    if (err) {
        fastify.log.error(err);
        process.exit(1)
    }
});
