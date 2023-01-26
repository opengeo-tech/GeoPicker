
const turf = require('@turf/turf');

/**
 * Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
 * @param  {Number} num    [description]
 * @param  {Number} digits [description]
 * @return {Number}        [description]
 */
function coordPrecision(num, prec = 7) {
  return Number(num.toPrecision(prec));
}

/**
 * Returns the location [lon.lat] rounded to `digits` decimals, or to 6 decimals by default.
 * @param  {Number} num    [description]
 * @param  {Number} digits [description]
 * @return {Number}        [description]
 */
function locPrecision(loc, prec = 7) {
  return loc.map(c => coordPrecision(c, prec));
}

/**
 * return Bounding Box of dataset
 * @param  {[type]} dataset [description]
 * @return {Object}         [minLon,minLat,maxLon,maxLat]
 */
function datasetBbox(dataset, prec = null) {
    const {minX, minY, maxX, maxY} = dataset.bands.getEnvelope()
        , xx = [minY, minX, maxY, maxX]
        , [minLat, minLon, maxLat, maxLon] = isNaN(prec) ? xx : xx.map(c => coordPrecision(c, prec));

    return {
      minLon,
      minLat,
      maxLon,
      maxLat,
    }
}

/**
 * check if lonlat is contained in dataset bbox
 * @param  {[type]} dataset [description]
 * @param  {[type]} lonlat  [description]
 * @return {[type]}         [description]
 */
function datasetContains(dataset, lonlat) {
  const [lon, lat] = lonlat
      , {minLon, minLat, maxLon, maxLat} = datasetBbox(dataset)

  return (lon >= minLon && lon <= maxLon &&
          lat >= minLat && lat <= maxLat );
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

/**
 * return metadata info of a dataset
 * @param  {[type]} dataset [description]
 * @return {[type]}         [description]
 */
function datasetInfo(dataset) {

  /* TODO pixelsize
  https://gis.stackexchange.com/questions/243639/how-to-take-cell-size-from-raster-using-python-or-gdal-or-rasterio
    const gt = dataset.geoTransform
      , [x, y] = [gt[1], -gt[5]]; */
  let type;

  if (dataset.bands) {
    type = 'raster';
  }
  else if (dataset.layers) {
    type = 'vector';
  }
  //console.log(dataset.bands.unitType)
  return {
    type,
    bands: dataset.bands.count(),
    width: dataset.rasterSize.x,
    height: dataset.rasterSize.y,
    bbox: datasetBbox(dataset, 6),
    //unit: dataset.bands.unitType,
    // TODO pixel: { x, y }
    // TODO noDataValue
    // TODO too long srs: (dataset.srs ? dataset.srs.toWKT() : 'null')
  }
}

module.exports = {
  densifyGeometry,
  datasetContains,
  coordPrecision,
  locPrecision,
  datasetBbox,
  datasetInfo
}