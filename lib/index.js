
const fs = require('fs')
	, _ = require('lodash')
	//, gdal = require('gdal-next')
	, gdal = require('gdal-async')
	, turf = require('@turf/turf');

//TODO maybe... https://github.com/caseycesari/geojson.js
const {'densify': Densify, info} = require('./utils');

function openFile(fileData, band, epsg) {

	const rasterdata = gdal.open(fileData)
		, rasterband = rasterdata.bands.get(band)
		, crs = gdal.SpatialReference.fromEPSG(epsg)
		, transform = new gdal.CoordinateTransformation(crs, rasterdata);

	return {
		info: () => {
			return info(rasterdata)
		},
		locPixel: loc => {
			try {
				const {x, y} = transform.transformPoint(loc[1], loc[0]);
				return rasterband.pixels.get(x, y);
			}
			catch(err) {
				console.log(err);
				return null;
			}
		}
	}
}

function setElevation(geojson, fileData, opts = {}) {

	const {band = 1, epsg = 4326, densify = false} = opts;

	if (densify !== false) {
		geojson = Densify(geojson, densify);
	}

	const raster = openFile(fileData, band, epsg);

	//FeatureCollection | Feature | Geometry
	turf.coordEach(geojson, async loc => {
		loc.push( raster.locPixel(loc) );
	});

	return geojson;
}

function getElevation(locs, fileData, opts = {}) {

	const {band = 1, epsg = 4326} = opts;

	const {locPixel} = fileData.locPixel ? fileData : openFile(fileData, band, epsg);

	if (_.size(locs) > 2) {

		return locs.map(loc => {
			return locPixel(loc);
		});
	}
	else {
		return locPixel(locs);
	}
}

module.exports = {
	gdal,
	openFile,
	densify: Densify,
	setElevation,
	getElevation
};
