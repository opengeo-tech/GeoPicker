const S = require('fluent-json-schema');

module.exports = async fastify => {

	const {setValue, getValue, densify} = fastify.gp;

	fastify.get('/densify/:locations', (req,res) => {
		//TODO
		return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
	});

	fastify.post('/densify/geometry', async req => {
		const densify = !!req.query.densify || config.densify;
		console.log(req.body)
		return densify(req.body, densify);
	});

/*	fastify.post('/simplify/geometry', async req => {
	});*/
/*	fastify.post('/meta', (req,res) => {
		return meta(req.body)
	});*/
}