
const fastify = require('fastify');
const cors = require('@fastify/cors');
const pino = require('pino')

const {setElevation, denisify} = require('./node-gdal');

const port = 3000;

const fileRaster = process.argv[2] || '../data/trentino-altoadige_30m.tif'

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

app.listen({port});