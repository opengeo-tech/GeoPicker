
const S = require('fluent-json-schema');

module.exports = async fastify => {

	const {config, defaultDataset, gpicker} = fastify
			, {setValue, getValue} = gpicker;


	fastify.get('/:dataset/:lon/:lat', {
		schema: {
			description: 'Get single location value by coordinates of dataset',
			params: S.object()
					.prop('dataset', S.string().enum(Object.keys(config.datasets)).required())
			    .prop('lon', S.number().required())
        	.prop('lat', S.number().required()),
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

	fastify.post('/:dataset/geometry', async req => {
		console.log(req.body)
		return setValue(req.body, defaultDataset);
	});

/*	fastify.post('/:dataset/:band/pixel', async req => {
		return setValue(req.body, defaultDataset);
	});

	fastify.get('/:dataset/:band/pixel', async req => {
		const point = getValue(req.params, defaultDataset)
	});
*/

	fastify.get('/densify/:locations', (req,res) => {
		//TODO
		return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
	});

	fastify.post('/densify/geometry', async req => {
		const densify = !!req.query.densify || config.densify;
		console.log(req.body)
		return densify(req.body, densify);
	});

	/*fastify.post('/simplify/geometry', async req => {
	});*/

	/*fastify.post('/meta', (req,res) => {
		return meta(req.body)
	});*/
}