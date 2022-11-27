
module.exports = async fastify => {

	const {defaultDataset, gp} = fastify
		, {setElevation, getElevation} = gp;

	fastify.post('/pixel/geometry', async req => {
console.log(req.body)
		return setElevation(req.body, defaultDataset);
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