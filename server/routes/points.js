const S = require('fluent-json-schema');

module.exports = async fastify => {

	const {defaultDataset, gp} = fastify
		, {setValue, getValue} = gp;


/*	fastify.post('/:dataset/:band/pixel', async req => {
		return setValue(req.body, defaultDataset);
	});

	fastify.get('/:dataset/:band/pixel', async req => {
		const point = getValue(req.params, defaultDataset)
	});
*/
	fastify.get('/elevation/:lon/:lat', {
		schema: {
			params: S.object()
			    .prop('lon', S.number().required())
        	.prop('lat', S.number().required()),
      /*query: S.object()
        .prop('from', S.integer().minimum(0).default(0))
        .prop('size', S.integer().minimum(0).default(10)),*/
		}
	}, async req => {

		const loc = [req.params.lon, req.params.lat].map(parseFloat)
			, [lon, lat] = loc;

		fastify.log.info({loc});

		return {
			lat,
			lon,
			val: getValue(loc, defaultDataset)
		}
	});
}