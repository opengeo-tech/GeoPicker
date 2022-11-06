
const fs = require('fs');
const fastify = require('fastify');
const cors = require('@fastify/cors');
const pino = require('pino');


const {setElevation, denisify} = require('./node-gdal');

const port = 3000;

const fileRaster = process.argv[2] || '../data/trentino-altoadige_10m.tif'

const app = fastify({
	logger: {
		transport: {
	    	target: 'pino-pretty'
	  	}
	}
})

app.register(cors);

app.post('/elevation', async req => {

  //return setElevation(req.body);
  //
  return setElevation(denisify(req.body), fileRaster);
});

app.get('/test.html', async (req,res) => {
	const stream = fs.createReadStream('../linestring.html');
	return res.type('text/html').send(stream);
});

app.listen({port});