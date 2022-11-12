
const fs = require('fs')
	, _ = require('lodash')
	, gdal = require('gdal-next')
	, turf = require('@turf/turf');

//TODO maybe... https://github.com/caseycesari/geojson.js

function densify(geojson, opts) {

	const {units = 'meters', length = 30} = opts;
//
//TODO use along: https://turfjs.org/docs/#lineChunk
//
	//https://turfjs.org/docs/#lineChunk
	const lineChunks = turf.lineChunk(geojson, length, {units});

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

function setElevation(geojson, fileRaster, opts = {}) {

	const {band = 1, epsg = 4326, densify = false} = opts;

	if (densify !== false) {
		geojson = densify(geojson, densify);
	}

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

module.exports = {
	gdal,
	densify,
	setElevation,
	getElevation
};
