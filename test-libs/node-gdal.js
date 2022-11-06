
const fs = require('fs');
const gdal = require('gdal-next');
const {coordEach, featureReduce} = require('@turf/meta');
const lineChunk = require('@turf/line-chunk');

function setElevation(geojson, fileRaster, opts = {}) {

	const {band = 1, epsg = 4326} = opts;

	const rasterdata = gdal.open(fileRaster)
		, rasterband = rasterdata.bands.get(band)
		, crs = gdal.SpatialReference.fromEPSG(epsg)
		, transform = new gdal.CoordinateTransformation(crs, rasterdata);

	coordEach(geojson, async loc => { //FeatureCollection | Feature | Geometry

		const {x, y} = transform.transformPoint(loc[0], loc[1]);

		try {
			loc.push(rasterband.pixels.get(x, y));
		}
		catch(err) {
			console.log(err)
		}
	});

	return geojson;
}

function denisify(geojson) {
	//https://turfjs.org/docs/#lineChunk
	const lineChunks = lineChunk(geojson, 30, {units:'meters'})

	let coordinates = [];

/*	return featureReduce(lineChunks, (previousValue, currentFeature) => {
	  //=previousValue
	  //=currentFeature
	  //=featureIndex
	  return coordinates.concat(currentFeature.geometry.coordinates)
	});*/
	lineChunks.features.forEach(f => {
		f.geometry.coordinates.pop()
		coordinates = coordinates.concat(f.geometry.coordinates)
	})

	return {
		type:'Feature',
		properties: {},
		geometry: {
			type: 'LineString',
			coordinates
		}
	}
}


if (require.main === module) {
	const { Console } = require("console");
	const console = new Console(process.stderr);

	console.time();

	const fileRaster = process.argv[2] || '../data/trentino-altoadige_30m.tif';
	const fileLine = process.argv[3] || '../data/traccia_calisio_50pt.geojson';
	const geojson = JSON.parse(fs.readFileSync(fileLine,'utf-8'));

	setElevation(geojson, fileRaster);

	process.stdout.write(JSON.stringify(geojson,null,4));

	console.timeEnd();
}
else {
  module.exports = {
  	gdal,
  	denisify,
    setElevation
  };
}