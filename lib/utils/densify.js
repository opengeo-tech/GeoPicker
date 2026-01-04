const turf = require('@turf/turf');

/**
 * add more points in input coordinates
 * @param  {Object} data linestring
 * @param  {Number} length
 * @return {Object}
 */
module.exports = function densifyLocations(data, length = 30) {
  // use: https://turfjs.org/docs/#lineChunk

  const opts = {units: 'meters'}
    , val = Number(length); //degrees, radians, miles, or kilometers

  if (Array.isArray(data[0])) { //array of array of coordinates

    const lineChunks = turf.lineChunk({
      type: 'LineString',
      coordinates: data
    }, val, opts);

    let coords = [], lastCoords;
    lineChunks.features.forEach(f => {
      lastCoords = f.geometry.coordinates.pop();
      coords = coords.concat(f.geometry.coordinates)
    });
    coords.push(lastCoords);

    data = coords;
  }
  else if (data.coordinates || data.geometry) {

    const lineChunks = turf.lineChunk(data, val, opts);

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