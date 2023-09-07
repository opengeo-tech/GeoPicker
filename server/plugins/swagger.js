/**
 * implements openApi Swagger interface
 */
const {resolve} = require('path')
    , fp = require('fastify-plugin')
    , Swagger = require('@fastify/swagger')
    , SwaggerUi = require('@fastify/swagger-ui');

module.exports = fp(async fastify => {

  const {config, package} = fastify
      , {version, description, homepage} = package
      , {attribution, swagger} = config
      , {routePrefix, docExpansion} = swagger;

  fastify.register(Swagger, {
    mode: 'dynamic',
    exposeRoute: true,
    openapi: {
      info: {
        title: 'GeoPicker API',
        description,
        version,
      },
      externalDocs: {
        url: homepage,
        description: attribution
      }
    }
  });

  fastify.register(SwaggerUi, {
    routePrefix: resolve(routePrefix),
    //initOAuth: { },
    uiConfig: {
      docExpansion,
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  });

})