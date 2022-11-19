
module.exports = async fastify => {

	fastify.get('/pixel/:locs', async req => {
		const locs = req.params.locs.split(',').map(parseFloat);
		return getElevation(locs, defaultRaster);
	});
}