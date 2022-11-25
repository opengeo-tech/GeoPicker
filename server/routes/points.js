
module.exports = async fastify => {

	const {defaultDataset, gp} = fastify
		, {setElevation, getElevation} = gp;


/*	fastify.post('/:raster/:band/pixel', async req => {
		return setElevation(req.body, defaultDataset);
	});

	fastify.get('/:raster/:band/pixel', async req => {
		const point = getElevation(req.params, defaultDataset)
	});
*/
	fastify.get('/pixel/:lat/:lon', async req => {

		const loc = [req.params.lat, req.params.lon].map(parseFloat)
			, [lat, lon] = loc;

		fastify.log.info({loc});

		return {
			lat,
			lon,
			val: getElevation(loc, defaultDataset)
		}
	});
}