
const fp = require('fastify-plugin')
    , Swagger = require('@fastify/swagger')
    , SwaggerUi = require('@fastify/swagger-ui');

module.exports = fp(async fastify => {

  const {config, package} = fastify
      , {version, description, homepage} = package
      , {attribution, swagger} = config
      , {routePrefix} = swagger;

  fastify.register(Swagger, {
    mode: 'dynamic',
    exposeRoute: true,
    openapi: {
      info: {
        title: 'Geopicker',
        description,
        version,
      },
      externalDocs: {
        url: homepage,
        description: attribution
      }
      //servers: [ Object ],
      //components: Object,
      //security: [ Object ],
      ////
      //tags: [ Object ]
      ////TODO keywords
    }
  });

  fastify.register(SwaggerUi, {
    routePrefix,
    //initOAuth: { },
    uiConfig: {
      docExpansion: 'full',
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