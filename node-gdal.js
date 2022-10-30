const gdal = require("gdal");

const fs = require('fs');

const file = process.argv[2] || './data/trentino-altoadige_90m.tif';

const point = {
	"type": "Point",
	"coordinates": [
	  11.0,
	  46.0
	]
}

const pointPadova= {
	"type": "Point",
	"coordinates": [
		11.703113376110231,
		45.305530526197494
	]
}

var dataset = gdal.open(file);

var band = dataset.bands.get(1);

var coordinateTransform = new gdal.CoordinateTransformation(gdal.SpatialReference.fromEPSG(4326), dataset);

var pt = coordinateTransform.transformPoint(pointPadova.coordinates[0], pointPadova.coordinates[1]);

let pixelVal;
try {
	pixelVal = band.pixels.get(pt.x, pt.y)
}
catch(err) {
	console.log(err)
}

console.log(pixelVal);