
module.exports = async fastify => {

	fastify.post('/:raster/:band/pixel', async req => {
		const densify = !!req.params.densify || config.densify;
		return setElevation(req.body, defaultRaster, {densify});
	});

	fastify.get('/:raster/:band/pixel', async req => {
		const point = getElevation(req.params, defaultRaster)
	});

	fastify.get('/pixel/:lat/:lon', async req => {
		const loc = [req.params.lat, req.params.lon].map(parseFloat);
		fastify.log.info({loc});
		return getElevation(loc, defaultRaster);
	});
}