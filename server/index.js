
const fs = require('fs')
		, path = require('path')
		, fastify = require('fastify')
		, cors = require('@fastify/cors')
		, pino = require('pino');


const {setElevation, getElevation, densify} = require('../lib');

const port = 3000;

const fileRaster = process.argv[2] || '../data/trentino-altoadige_90m.tif'

const pagepath = path.resolve(__dirname,'../index.html');

const app = fastify({
	logger: {
		transport: {
			target: 'pino-pretty'
		}
	}
});

app.register(cors);

app.post('/elevation', async req => {

  return setElevation(req.body, fileRaster, {densify: req.params.densify});
});

app.get('/:raster/:band/pixel', async req => {
	const point = setElevation(req.params, fileRaster)
});

app.get('/', async (req,res) => {
	const stream = fs.createReadStream(pagepath);
	return res.type('text/html').send(stream);
});

app.listen({port});