
const fastify = require('fastify');
const cors = require('@fastify/cors');

const {setElevation} = require('./node-gdal');

const port = 3000;

const fileRaster = process.argv[2] || '../data/trentino-altoadige_30m.tif'

const app = fastify({
	logger: true
})

app.register(cors);

app.post('/elevation', async req => {

  return setElevation(req.body, fileRaster);
});

app.listen({port});