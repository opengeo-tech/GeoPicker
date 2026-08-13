/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const buildApp = require('./app')
    , parserConfig = require('./parserConfig')
    , S = require('fluent-json-schema')
    , {package} = require('../lib/geopicker')
    , path = require('path');

const configPath = process.env.CONFIG || path.join(__dirname, 'config.yml')
    , config = parserConfig.load({basepath: path.dirname(configPath), configfile: path.basename(configPath)})
    , configSchema = require('./schemas/config')(S)
    , {valid, errors} = parserConfig.validateConfig(config, configSchema.valueOf());

if (!valid) {
    console.error('Invalid config.yml:\n' + errors.join('\n'))
    process.exit(1)
}

const {port, host} = config
    , fastify = buildApp(config);

fastify.log.info(`Geopicker v${package.version} started...`);

fastify.listen({port, host}, err => {
    if (err) {
        fastify.log.error(err);
        process.exit(1)
    }
});
