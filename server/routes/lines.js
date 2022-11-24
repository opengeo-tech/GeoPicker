
module.exports = async fastify => {

	const {setElevation, getElevation} = fastify.gp;

	fastify.get('/pixel/:locs', async req => {
		const locs = req.params.locs.split(',').map(parseFloat);
		return getElevation(locs, defaultRaster);
	});
}
/*
GET /

GET /pixel/:lat/:lon
GET /pixel/:loc

POST /:dataset/:band/pixel
GET /:dataset/:band/pixel

GET /densify/locations
POST /densify/geometry
*/