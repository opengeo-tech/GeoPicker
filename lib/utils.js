
const turf = require('@turf/turf');

function densifyGeometry(geojson, opts) {

	const {units = 'meters', length = 30} = opts
      , lineChunks = turf.lineChunk(geojson, length, {units});
  // TODO use along: https://turfjs.org/docs/#lineChunk

	/*	return featureReduce(lineChunks, (previousValue, currentFeature) => {
	  //=previousValue
	  //=currentFeature
	  //=featureIndex
	  return coordinates.concat(currentFeature.geometry.coordinates)
	}); */
  let coordinates = [];
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
	densifyGeometry,
	info: dataset => ({
		"number of bands": dataset.bands.count(),
		"width": dataset.rasterSize.x,
		"height": dataset.rasterSize.y,
		"geotransform": dataset.geoTransform,
		"srs": (dataset.srs ? dataset.srs.toWKT() : 'null'),
	})
}