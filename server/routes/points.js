
module.exports = async fastify => {

	const {defaultDataset, gp} = fastify
		, {setValue, getValue} = gp;


/*	fastify.post('/:raster/:band/pixel', async req => {
		return setValue(req.body, defaultDataset);
	});

	fastify.get('/:raster/:band/pixel', async req => {
		const point = getValue(req.params, defaultDataset)
	});
*/
	fastify.get('/pixel/:lon/:lat', async req => {

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