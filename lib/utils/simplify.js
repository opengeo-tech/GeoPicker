const turf = require('@turf/turf');

/**
 * simplify points in input coordinates
 * @param  {Object} data linestring
 * @param  {Number} factor
 * @return {Object}
 */
module.exports = function simplifyLocations(data, factor = 0.01) {
  // use: https://turfjs.org/docs/#simplify

  const opts = {tolerance: Number(factor), highQuality: true, units: 'meters'};

  if (Array.isArray(data[0])) { //array of array of coordinates
    const simply = turf.simplify({
      type: 'LineString',
      coordinates: data
    }, opts);

    return simply.coordinates;
  }
  else if (data.coordinates || data.geometry) {

    const simply = turf.simplify(data, opts);

    if (data.coordinates) {
      data.coordinates = simply.coordinates;
    }
    else if (data.geometry) {
      data.geometry.coordinates = simply.coordinates;
    }
  }

  return data;
}