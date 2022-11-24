
const fs = require('fs')
	, _ = require('lodash')
	//, gdal = require('gdal-next')
	, gdal = require('gdal-async')
	, turf = require('@turf/turf');

//TODO maybe... https://github.com/caseycesari/geojson.js

function openRaster(fileRaster, band, epsg) {

	const rasterdata = gdal.open(fileRaster)
		, rasterband = rasterdata.bands.get(band)
		, crs = gdal.SpatialReference.fromEPSG(epsg)
		, transform = new gdal.CoordinateTransformation(crs, rasterdata);

	return {
		locPixel: loc => {
			try {
				const {x, y} = transform.transformPoint(loc[0], loc[1]);
				return rasterband.pixels.get(x, y);
			}
			catch(err) {
				console.log(err);
				return null;
			}
		}
	}
}

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

	const raster = openRaster(fileRaster);

	//FeatureCollection | Feature | Geometry
	turf.coordEach(geojson, async loc => {
		loc.push( raster.locPixel(loc) );
	});

	return geojson;
}

function getElevation(locs, fileRaster, opts = {}) {

	const {band = 1, epsg = 4326} = opts;

	const raster = openRaster(fileRaster, band, epsg);

	if (_.size(locs) > 2) {

		return locs.map(loc => {
			return raster.locPixel(loc);
		});
	}
	else {
		return raster.locPixel(locs);
	}
}

module.exports = {
	gdal,
	densify,
	setElevation,
	getElevation
};
