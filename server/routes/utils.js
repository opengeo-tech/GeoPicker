
module.exports = async fastify => {

	const {setElevation, getElevation, densify} = fastify.gp;

	fastify.get('/densify/:locations', (req,res) => {
		//TODO
		return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
	});

	fastify.post('/densify/geometry', async req => {
		const densify = !!req.params.densify || config.densify;
		console.log(req.body)
		return densify(req.body, densify);
	});

/*	fastify.post('/meta', (req,res) => {
		return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
	});*/
}