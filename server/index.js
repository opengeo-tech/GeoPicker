
const fs = require('fs')
		, path = require('path')
		, fastifyjs = require('fastify')
    	//, dotenv = require('dotenv').config()
    	, configyml = require('@stefcud/configyml')
		, cors = require('@fastify/cors')
		, pino = require('pino');

const {setElevation, getElevation, densify, gdal} = require('../lib');

const basepath = process.cwd()
    , {name, version} = require(`${basepath}/package.json`);

const config = configyml({basepath: __dirname});

const fileRaster = process.argv[2] || '../data/trentino-altoadige_90m.tif'

const pagemap = path.resolve(__dirname,'../index.html');

const fastify = fastifyjs({
	logger: config.logger
});

fastify.register(cors, instance => {
    return (req, cb) => {
        cb(null, config.cors);
    }
});

//ENDPOINTS

fastify.post('/densify', async req => {

  const densify = !!req.params.densify || config.densify;

  return densify(req.body, densify);
});

fastify.post('/pixel', async req => {

});

fastify.post('/:raster/:band/pixel', async req => {

  const densify = !!req.params.densify || config.densify;

  return setElevation(req.body, fileRaster, {densify});
});

fastify.get('/:raster/:band/pixel', async req => {
	const point = getElevation(req.params, fileRaster)
});

fastify.get('/map.html', async (req,res) => {
	const stream = fs.createReadStream(pagemap);
	return res.type('text/html').send(stream);
});

fastify.get('/', async (req,res) => {

	//TODO check geotiffs paths
	const status = 'OK';

	res.send({
		name,
		version,
		status,
		gdal: gdal.version
	})
});

fastify.listen({port: config.port}, err => {
	if (err) {
		fastify.log.error(err);
		process.exit(1)
	}
	console.log(`Starting GeotiffPicker... ${version}\nConfig:\n`, JSON.stringify(config,null,4));
});