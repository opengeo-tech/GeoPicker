
const fs = require('fs');
const gdal = require('gdal-next');
/*const {coordEach, featureReduce} = require('@turf/meta');
const lineChunk = require('@turf/line-chunk');
*/
const turf = require('@turf/turf');

function setElevation(geojson, fileRaster, opts = {}) {

	const {band = 1, epsg = 4326} = opts;

	const rasterdata = gdal.open(fileRaster)
		, rasterband = rasterdata.bands.get(band)
		, crs = gdal.SpatialReference.fromEPSG(epsg)
		, transform = new gdal.CoordinateTransformation(crs, rasterdata);

	turf.coordEach(geojson, async loc => { //FeatureCollection | Feature | Geometry

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

function getElevation(locs, fileRaster, opts = {}) {

	const {band = 1, epsg = 4326} = opts;

	const rasterdata = gdal.open(fileRaster)
		, rasterband = rasterdata.bands.get(band)
		, crs = gdal.SpatialReference.fromEPSG(epsg)
		, transform = new gdal.CoordinateTransformation(crs, rasterdata);

	if (Array.isArray(locs)) {

		return locs.map(loc => {

			const {x, y} = transform.transformPoint(loc[0], loc[1]);

			try {
				pixels = rasterband.pixels.get(x, y);
			}
			catch(err) {
				console.log(err)
			}
		});
	}
	else {
		const {x, y} = transform.transformPoint(locs[0], locs[1]);

		try {
			return rasterband.pixels.get(x, y);
		}
		catch(err) {
			console.log(err)
		}
	}
}

function denisify(geojson) {
	//https://turfjs.org/docs/#lineChunk
	const lineChunks = turf.lineChunk(geojson, 30, {units:'meters'})

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

module.exports = {
	gdal,
	denisify,
  setElevation
};
