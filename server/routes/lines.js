const S = require('fluent-json-schema');

module.exports = async fastify => {

	const {defaultDataset, gp} = fastify
		, {setValue, getValue} = gp;

	fastify.post('/elevation/geometry', async req => {
console.log(req.body)
		return setValue(req.body, defaultDataset);
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