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

var dataset = gdal.open(file);

var band = dataset.bands.get(1);

var coordinateTransform = new gdal.CoordinateTransformation(gdal.SpatialReference.fromEPSG(4326), dataset);

var pt = coordinateTransform.transformPoint(point.coordinates[0], point.coordinates[1]);

console.log(band.pixels.get(pt.x, pt.y));