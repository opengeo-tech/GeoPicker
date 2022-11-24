
const turf = require('@turf/turf');

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

module.exports = {
	densify,
	info: dataset => ({
		"number of bands": dataset.bands.count(),
		"width": dataset.rasterSize.x,
		"height": dataset.rasterSize.y,
		"geotransform": dataset.geoTransform,
		"srs": (dataset.srs ? dataset.srs.toWKT() : 'null'),
	})
}