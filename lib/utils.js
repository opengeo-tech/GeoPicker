
const turf = require('@turf/turf');

/**
 * Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
 * @param  {Number} num    [description]
 * @param  {Number} digits [description]
 * @return {Number}        [description]
 */
function setPrec(num, prec = 7) {
  return Number(num.toPrecision(prec));
}

/**
 * return Bounding Box of dataset
 * @param  {[type]} dataset [description]
 * @return {Object}         [minLon,minLat,maxLon,maxLat]
 */
function datasetBbox(dataset, prec = 7) {
    const {minX, minY, maxX, maxY} = dataset.bands.getEnvelope()
        , xx = [minY, minX, maxY, maxX]
        , [minLat, minLon, maxLat, maxLon] = isNaN(prec) ? xx : xx.map(c => setPrec(c, prec));

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

  //TODO support array like setPrecision

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

/**
 * return humanize bytes size
 * @param  {Number} bytes
 * @return {String}
 */
function humanSize(bytes) {
    if (bytes === 0) return bytes;
    const sizes = ['Bytes','KB','MB','GB','TB']
        , i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 1) + ' ' + sizes[i];
}

/**
 * return data with coordintates precision changed
 * @param  {Number} bytes
 * @return {String}
 */
function setPrecision(data, prec = 7) {

  if (Array.isArray(data[0])) { //array of coordinates
    data.forEach(loc => {
      loc = [ setPrec(loc[0], prec), setPrec(loc[1], prec) ];
    });
  }
  else if (data.lon && data.lat) {
    data.lon = setPrec(data.lon, prec)
    data.lat = setPrec(data.lat, prec)
  }
  else if (data.longitude && data.latitude) {
    data.longitude = setPrec(data.longitude, prec)
    data.latitude = setPrec(data.latitude, prec)
  }
  else if (data.coordinates || data.geometry || data.features) {

    turf.coordEach(data, loc => {
        loc[0] = setPrec(loc[0], prec);
        loc[1] = setPrec(loc[1], prec);

        // FIX ME setPrec dont work
    });
  }
}

module.exports = {
  densifyGeometry,
  datasetContains,
  setPrecision,
  datasetBbox,
  datasetInfo,
  humanSize
}