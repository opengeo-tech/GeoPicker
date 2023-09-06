
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

function locPrec(loc, prec = 7) {
  return [setPrec(loc[0], prec), setPrec(loc[1], prec)]
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
 * @return {Object}
 */
function setPrecision(data, prec) {

  if (Array.isArray(data[0])) { //array of array of coordinates
    data.forEach(loc => {
        loc[0] = setPrec(loc[0], prec);
        loc[1] = setPrec(loc[1], prec);
    });
  }
  else if (data.coordinates || data.geometry) {
    turf.coordEach(data, loc => {
        loc[0] = setPrec(loc[0], prec);
        loc[1] = setPrec(loc[1], prec);
        // FIX ME setPrec dont work
    });
  }
  else if (data.lon && data.lat) {
    data.lon = setPrec(data.lon, prec)
    data.lat = setPrec(data.lat, prec)
  }

  return data;
}

/**
 * add more points in input coordinates
 * @param  {Object} data linestring
 * @param  {Number} length
 * @return {Object}
 */
function densifyLocations(data, length = 30) {
  // use: https://turfjs.org/docs/#lineChunk

  const val = Number(length)
      , units = 'meters'; //degrees, radians, miles, or kilometers

  if (Array.isArray(data[0])) { //array of array of coordinates

    const lineChunks = turf.lineChunk({
      type: 'LineString',
      coordinates: data
    }, val, {units});

    let coords = [], lastCoords;
    lineChunks.features.forEach(f => {
      lastCoords = f.geometry.coordinates.pop();
      coords = coords.concat(f.geometry.coordinates)
    });
    coords.push(lastCoords);

    data = coords;
  }
  else if (data.coordinates || data.geometry) {

    const lineChunks = turf.lineChunk(data, val, {units});

    let coords = [], lastCoords;
    lineChunks.features.forEach(f => {
      lastCoords = f.geometry.coordinates.pop();
      coords = coords.concat(f.geometry.coordinates)
    });
    coords.push(lastCoords);

    if (data.coordinates) {
      data.coordinates = coords;
    }
    else if (data.geometry) {
      data.geometry.coordinates = coords
    }
  }

  return data;
}

/**
 * simplify points in input coordinates
 * @param  {Object} data linestring
 * @param  {Number} factor
 * @return {Object}
 */
function simplifyLocations(data, factor = 0.01) {
  // use: https://turfjs.org/docs/#simplify


  const opts = {tolerance: Number(factor), highQuality: true};

  if (Array.isArray(data[0])) { //array of array of coordinates
    const simply = turf.simplify({
      type: 'LineString',
      coordinates: data
    }, opts);

    data = simply.coordinates;
  }
  else if (data.coordinates || data.geometry) {

    const simply = turf.simplify(data, opts);

    if (data.coordinates) {
      data.coordinates = simply.coordinates;
    }
    else if (data.geometry) {
      data.geometry.coordinates = simply.coordinates
    }
  }

  return data;
}

/**
 * parse stringified locations
 * @param  {String} stringified locs
 * @return {Array}
 */
function parseLocations(str, sepLocs = '|', sepCoords = ',') {
  return str
    .split(sepLocs)
    .map(l => l.split(sepCoords))
    .map(c => {
      return c.map(Number)
      //Number() just inside locPixel() but required by setPrecision
    })
}

/**
 * return metadata info of a geometry
 * @param  {Object} geometry
 * @return {Object}
 */
function getMetadata(data) {

  const opts = {units: 'meters'};

  let meta = {}
  /*if (Array.isArray(data[0])) { //array of array of coordinates
    //TODO
  }
  else*/ if (data.coordinates || data.geometry) {

    const bb = turf.bbox(data)
        , [minLon, minLat, maxLon, maxLat] = bb.map(c => setPrec(c))
        , bbox = {minLon, minLat, maxLon, maxLat};

    const len = turf.length(data, opts)
        , length = Number(len.toFixed(2));

    const cen = turf.centroid(data)
        , centroid = locPrec(cen.geometry.coordinates)

    const along = turf.along(data, len/2, opts)
        , middlepoint = locPrec(along.geometry.coordinates)

    const coords = data.coordinates || data.geometry.coordinates
        , bearing = turf.bearing(coords[0], coords.at(-1))
        , direction = Number(bearing.toFixed(2))

    meta = {
      length,
      direction,
      centroid,
      middlepoint,
      bbox,
    }
  }

  return meta;
}

module.exports = {
  simplifyLocations,
  densifyLocations,
  datasetContains,
  parseLocations,
  setPrecision,
  getMetadata,
  datasetBbox,
  datasetInfo,
  humanSize,
}