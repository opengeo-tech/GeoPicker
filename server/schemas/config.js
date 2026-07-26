module.exports = S => {
  return S.object()
    .prop('port', S.number())
    .prop('host', S.string())
    .prop('prefix', S.string())
    .prop('fastifyConf', S.object())
    .prop('verbose', S.boolean())
    .prop('cors', S.object().prop('enabled', S.boolean()).required(['enabled']))
    .prop('compress', S.object().prop('enabled', S.boolean()).required(['enabled']))
    .prop('swagger', S.object().prop('enabled', S.boolean()).required(['enabled']))
    .prop('demopage', S.object().prop('enabled', S.boolean()).required(['enabled']))
    .prop('datasets', S.object().prop('default', S.string()).required(['default']))
    .required([
      'port',
      'host',
      'prefix',
      'fastifyConf',
      'verbose',
      'cors',
      'compress',
      'swagger',
      'demopage',
      'datasets'
    ]);
}
