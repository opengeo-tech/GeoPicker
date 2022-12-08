
const S = require('fluent-json-schema');

module.exports = async fastify => {

	const {config, defaultDataset, gpicker} = fastify
			, {setValue, getValue} = gpicker;


	fastify.get('/:dataset/:lon/:lat', {
		schema: {
			description: 'Get single location value by coordinates of dataset',
			params: S.object()
			.prop('dataset', S.string().required().enum(Object.keys(config.datasets)))
			.prop('lon', S.number().required())
			.prop('lat', S.number().required()),
		}
	}, async req => {

		console.log('params',req.params);

		const {lon, lat} = req.params;

		return {
			lon,
			lat,
			val: getValue([lon, lat], defaultDataset)
		}
	});

	fastify.post('/:dataset/geometry', {
		//https://github.com/opengeo-tech/geo-picker/issues/16
		schema: {
			description: 'Post a geojson geometry',
			body: S.object()
				.additionalProperties(false)
        .prop('type', S.string().required().enum(['LineString','Point']))
        .prop('coordinates', S.array().required().minItems(1).items(
        		S.array().minItems(2)
        	).required())
        //.maxItems(config.linestring.max_locations)
      /*response: {
        200: S.object().prop('created', S.boolean())
      }*/
		}
	},async req => {
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

	fastify.post('/densify/geometry', async req => {
		const densify = !!req.query.densify || config.densify;
		console.log(req.body)
		return densify(req.body, densify);
	});
/*	fastify.get('/densify/:locations', (req,res) => {
		//TODO
		return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
	});*/

	/*fastify.post('/simplify/geometry', async req => {
	});*/

	/*fastify.post('/meta', (req,res) => {
		return meta(req.body)
	});*/
}