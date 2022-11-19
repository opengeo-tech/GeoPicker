
module.exports = async fastify => {

	fastify.get('/densify', (req,res) => {
		return {densify:1}//res.code(400).send({status: config.errors.densify_nobody})
	});

	fastify.post('/densify', async req => {
		const densify = !!req.params.densify || config.densify;
		console.log(req.body)
		return densify(req.body, densify);
	});

}