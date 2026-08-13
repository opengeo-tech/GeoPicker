/*
 * GeoPicker-server
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const fastifyApp = require('./app')
    , parserConfig = require('./parserConfig')
    , S = require('fluent-json-schema')
    , {package} = require('../lib/geopicker')
    , path = require('path');

function loadConfig(file) {
    const configPath = file || process.env.CONFIG || path.join(__dirname, 'config.yml')
        , config = parserConfig.load({basepath: path.dirname(configPath), configfile: path.basename(configPath)})
        , configSchema = require('./schemas/config')(S)
        , {valid, errors} = parserConfig.validateConfig(config, configSchema.valueOf())
        , host = process.env.HOST || config.host || '0.0.0.0'
        , port = process.env.PORT || config.port || 8080;

    return {config, configPath, valid, errors, host, port};
}

function start() {
    const {config, valid, errors, host, port} = loadConfig();

    if (!valid) {
        console.error('Invalid config.yml:\n' + errors.join('\n'))
        process.exit(1)
    }

    const fastify = fastifyApp(config);

    fastify.log.info(`Geopicker v${package.version} starting on ${host}:${port} ...`);

    fastify.listen({host, port}, err => {
        if (err) {
            fastify.log.error(err);
            process.exit(1)
        }
    });

    return fastify;
}

if (require.main === module) {
    start();
}

module.exports = {
    loadConfig,
    start
};
