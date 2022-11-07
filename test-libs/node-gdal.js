
const fs = require('fs');
const gdal = require('gdal-next');
const {coordEach} = require('@turf/meta');

function setElevation(geojson, fileRaster, band = 1, epsg = 4326) {

	const rasterdata = gdal.open(fileRaster)
		, Band = rasterdata.bands.get(band)
		, transform = new gdal.CoordinateTransformation(gdal.SpatialReference.fromEPSG(epsg), rasterdata);

	coordEach(geojson, async loc => { //FeatureCollection | Feature | Geometry

		const {x, y} = transform.transformPoint(loc[0], loc[1]);

		try {

			loc[2] = Band.pixels.get(x, y);
		}
		catch(err) {
			console.log(err)
		}
	});

	return geojson;
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
    setElevation
  };
}