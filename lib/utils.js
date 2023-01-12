
const turf = require('@turf/turf');


/**
 * original from Leaflet.js
 * Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
 * @param  {Number} num    [description]
 * @param  {Number} digits [description]
 * @return {Number}        [description]
 */
function coordPrecision(num, p = 7) {
  return Number(num.toPrecision(p));
}

function datasetBbox(dataset) {
    const {minX, minY, maxX, maxY} = dataset.bands.getEnvelope()
        , [minLat, minLon, maxLat, maxLon] = [minY, minX, maxY, maxX].map(c => coordPrecision(c));

    return {
      minLon,
      minLat,
      maxLon,
      maxLat,
    }
}
/**
 * add more points in a linestring
 * @param  {Object} geojson linestring
 * @param  {Object} opts    units = 'meters', length = 30
 * @return {Object}         [description]
 */
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
  coordPrecision,
  datasetBbox,
	info: dataset => {

    /* TODO pixelsize
    https://gis.stackexchange.com/questions/243639/how-to-take-cell-size-from-raster-using-python-or-gdal-or-rasterio
      const gt = dataset.geoTransform
        , [x, y] = [gt[1], -gt[5]]; */

    //console.log(dataset.bands.unitType)
    return {
      bands: dataset.bands.count(),
      width: dataset.rasterSize.x,
      height: dataset.rasterSize.y,
      bbox: datasetBbox(dataset),
      //unit: dataset.bands.unitType,
      // TODO pixel: { x, y }
      // TODO noDataValue
      // TODO too long srs: (dataset.srs ? dataset.srs.toWKT() : 'null')
    }
  }
}