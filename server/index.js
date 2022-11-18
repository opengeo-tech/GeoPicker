
const fs = require('fs')
		, path = require('path')
		, Fastify = require('fastify')
		, cors = require('@fastify/cors')
    	//, dotenv = require('dotenv').config()
    , configyml = require('@stefcud/configyml')
		, pino = require('pino');

const {setElevation, getElevation, densify, gdal} = require('geotiff-picker');

const {name, version} = require(`${__dirname}/package.json`);

const config = configyml({basepath: __dirname});

//TODO check geotiffs paths
var status = 'OK';

const defaultRaster = `${config.datapath}${config.rasters.default.path}`;

//TODO funch mapping raster id by config converto to file paths

const pagemap = path.resolve(__dirname,'../index.html');

if (!fs.existsSync(config.datapath)) {
  status = config.errors.nodatadir;
  console.warn(status)
}

const fastify = Fastify({
	logger: config.logger
});

fastify.register(cors, instance => {
    return (req, cb) => {
        cb(null, config.cors);
    }
});

//ENDPOINTS
//TODO check paramers types, length
//
fastify.get('/densify', (req,res) => {
	return res.code(400).send({status: config.errors.densify_nobody})
});

fastify.post('/densify', async req => {
  const densify = !!req.params.densify || config.densify;
	console.log(req.body)
  return densify(req.body, densify);
});

fastify.post('/:raster/:band/pixel', async req => {

  const densify = !!req.params.densify || config.densify;

  return setElevation(req.body, defaultRaster, {densify});
});

fastify.get('/:raster/:band/pixel', async req => {
	const point = getElevation(req.params, defaultRaster)
});

fastify.get('/pixel/:locs', async req => {
	const locs = req.params.locs.split(',').map(parseFloat);
		return getElevation(locs, defaultRaster);
});

fastify.get('/pixel/:lat/:lon', async req => {
		const loc = [req.params.lat, req.params.lon].map(parseFloat);
		fastify.log.info({loc})
		return getElevation(loc, defaultRaster);
});

fastify.get('/map.html', async (req,res) => {
	const stream = fs.createReadStream(pagemap);
	return res.type('text/html').send(stream);
});

fastify.get('/', async (req,res) => {
	res.send({
		status,
		name,
		version,
		gdal: gdal.version
	})
});

fastify.listen({port: config.port, host: '0.0.0.0'}, err => {
	if (err) {
		fastify.log.error(err);
		process.exit(1)
	}
	console.log(`GeotiffPicker ${version} \nConfig:\n`, JSON.stringify(config,null,4));
});