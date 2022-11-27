
module.exports = async fastify => {

	const {setElevation, getElevation, densify} = fastify.gp;

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
		const simplify = !!req.query.simplify || config.simplify;
		console.log(req.body)
		return simplify(req.body, simplify);
	});*/
/*	fastify.post('/meta', (req,res) => {
		return meta(req.body)
	});*/
}