
const fs = require('fs');
const fastify = require('fastify');
const cors = require('@fastify/cors');
const pino = require('pino');


const {setElevation, getElevation, densify} = require('../lib');

const port = 3000;

const fileRaster = process.argv[2] || '../data/trentino-altoadige_90m.tif'

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
	const stream = fs.createReadStream('../linestring.html');
	return res.type('text/html').send(stream);
});

app.listen({port});