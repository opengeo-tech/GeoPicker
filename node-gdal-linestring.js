

const fs = require('fs');
const gdal = require("gdal");
const {coordEach} = require('@turf/meta');

const file = process.argv[2] || './data/trentino-altoadige_10m.tif';

const point = {
	"type": "Point",
	"coordinates": [
	  11.0,
	  46.0
	]
}

const linestring = JSON.parse(fs.readFileSync('./data/traccia_calisio_50pt.geojson','utf-8'));

const rasterdata = gdal.open(file);
const band = rasterdata.bands.get(1);
const coordinateTransform = new gdal.CoordinateTransformation(gdal.SpatialReference.fromEPSG(4326), rasterdata);


var pt = coordinateTransform.transformPoint(pointPadova.coordinates[0], pointPadova.coordinates[1]);

let pixelVal;
try {
	pixelVal = band.pixels.get(pt.x, pt.y)
}
catch(err) {
	console.log(err)
}

console.log(pixelVal);

coordEach(linestring, (loc,coordIndex,featureIndex,multiFeatureIndex,geometryIndex) => {

	const props = {coordIndex,featureIndex,multiFeatureIndex,geometryIndex}

	console.log(loc, props)
	loc[2]=0
})

