const turf = require('@turf/turf');

const {setPrec} = require('./index');

function locPrec(loc, prec = 7) {
  return [setPrec(loc[0], prec), setPrec(loc[1], prec)]
}

/**
 * return metadata info of a geometry
 * @param  {Object} geometry
 * @return {Object}
 */
module.exports = function metadata(data) {

  const opts = {units: 'meters'};

  let geo = {
    type: 'LineString',
    coordinates: []
  };

  if (Array.isArray(data[0])) {
    geo.coordinates = data;
  }
  else if (data.coordinates) {
    geo = data;
  }
  else if (data.geometry) {
    geo = data.geometry;
  }

  const bb = turf.bbox(geo)
      , [minLon, minLat, maxLon, maxLat] = bb.map(c => setPrec(c))
      , bbox = {minLon, minLat, maxLon, maxLat}
  //
      , len = turf.length(geo, opts)
      , length = Number(len.toFixed(2))
  //
      , cen = turf.centroid(geo)
      , centroid = locPrec(cen.geometry.coordinates)
  //
      , along = turf.along(geo, len/2, opts)
      , middlepoint = locPrec(along.geometry.coordinates)
  //
      , coords = geo.coordinates || geo.geometry.coordinates
      , bearing = turf.bearing(coords[0], coords.at(-1))
      , direction = Number(bearing.toFixed(2));

  return {
    length,
    direction,
    centroid,
    middlepoint,
    bbox,
  }
}