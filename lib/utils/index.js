
const gdal = require('gdal-async')
    , turf = require('@turf/turf');

const contourLines = require('./contour');
const densifyLocations = require('./densify');
const simplifyLocations = require('./simplify');
const metadata = require('./metadata');

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
 * check if lonlat is contained in dataset bbox
 * @param  {[type]} dataset [description]
 * @param  {[type]} lonlat  [description]
 * @return {[type]}         [description]
 */
function bboxContains(bbox, lon, lat) {
  const {minLon, minLat, maxLon, maxLat} = bbox;
  return (lon >= minLon && lon <= maxLon &&
          lat >= minLat && lat <= maxLat );
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

function epsg2Unit(epsg) {
  const units = {
    4326: 'degree',
    3857: 'meters'
  };
  return units[epsg] || 'unknown';
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
 * return metadata info of a dataset
 * @param  {[type]} dataset [description]
 * @return {[type]}         [description]
 */
function datasetInfo(dataset, band = 1, fileData) {

  const opts = {units: 'meters'};

  let type = 'unknown';

  if (dataset.bands) {
    type = 'raster';
  }
  else if (dataset.layers) {
    type = 'vector';
  }

  const rasterband = dataset.bands.get(band)
      , {unitType, noDataValue, dataType} = rasterband
      , proj = new gdal.SpatialReference(dataset.srs.toWKT())
      , epsg = Number(proj.getAuthorityCode())
      , {'x': width, 'y': height} = dataset.rasterSize
      , bbox = datasetBbox(dataset)

  const bboxPoly = turf.bboxPolygon(Object.values(bbox))
      , {geometry: {coordinates}} = turf.centroid(bboxPoly)
      , [lon, lat] = coordinates
      , centroid = {lon, lat}

  const stats = rasterband.getStatistics(true, true)//may be slow

  const {geoTransform} = dataset
      , pixelSize = {
          unit: unitType || epsg2Unit(epsg),
          x: geoTransform[1],
          y: -geoTransform[5],
        };

  if (pixelSize.unit === 'degree') {
    //approximate conversion to meters based on the pixel in the centroid
    const distX = turf.distance([lon, lat], [lon + pixelSize.x, lat], opts)
        , distY = turf.distance([lon, lat], [lon, lat + pixelSize.y], opts);
    pixelSize.avgInMeters = Math.round((distX+distY) / 2);
  }

  return {
    type,
    epsg,
    band,
    dataType,
    noDataValue,
    stats,
    width,
    height,
    pixelSize,
    centroid,
    bbox
  };
}

module.exports = {
  bboxContains,
  contourLines,
  datasetBbox,
  datasetInfo,
  densifyLocations,
  humanSize,
  metadata,
  parseLocations,
  setPrecision,
  simplifyLocations,
}