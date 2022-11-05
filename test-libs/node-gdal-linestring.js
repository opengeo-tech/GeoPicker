

const fs = require('fs');
const gdal = require("gdal-next");
const {coordEach} = require('@turf/meta');

const file = process.argv[2] || '../data/trentino-altoadige_30m.tif';

const point = {
	"type": "Point",
	"coordinates": [
	  11.0,
	  46.0
	]
}

const linestring = JSON.parse(fs.readFileSync('../data/traccia_calisio_50pt.geojson','utf-8'));

const rasterdata = gdal.open(file);
const band = rasterdata.bands.get(1);

const coordinateTransform = new gdal.CoordinateTransformation(gdal.SpatialReference.fromEPSG(4326), rasterdata);

console.time();

coordEach(linestring, async loc => { //loc,coordIndex,featureIndex,multiFeatureIndex,geometryIndex)

	//const props = {coordIndex,featureIndex,multiFeatureIndex,geometryIndex}

	const {x, y} = coordinateTransform.transformPoint(loc[0], loc[1]);

	try {

		loc[2] = band.pixels.get(x, y);
	}
	catch(err) {
		console.log(err)
	}

	//console.log(loc, props)
});


console.log(JSON.stringify(linestring,null,4))


console.timeEnd();