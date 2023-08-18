
const togpx = require('togpx');

module.exports = fastify => {
  const {config, gpicker, package} = fastify
      , {sepLocs, sepCoords} = config
      , {utils: {parseLocations}} = gpicker
      , {version, homepage} = package
      , creator = `Geopicker ${version} - ${homepage}`;

  return {
    gpxRead: (data, req) => {
      const feature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        };

      //TODO parser gpx

      return feature
    },
    gpxWrite: (raw, req) => {

      const data = JSON.parse(raw)

      let feature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        };

      if (Array.isArray(data)) {
        if (data.length === 1) {          //lonlat point
          const {lon, lat} = req.params;
          feature.geometry.type = 'Point';
          feature.geometry.coordinates = [lon, lat, data[0]];
        }
        else if (req.params.locations) { //locations via stringified GET
          const locations = parseLocations(req.params.locations, sepLocs, sepCoords);
          locations.forEach((loc, k) => {
            loc.push(data[k])
          });
          feature.geometry.coordinates = locations;
        }
        else {                           //location array in POST body
          feature.geometry.coordinates = data;
        }
      }
      else if (data.coordinates || data.geometry || data.features) {
        feature = data
      }
      else if (data.lon && data.lat && data.val) {
        feature.geometry.type = 'Point';
        feature.geometry.coordinates = [data.lon, data.lat, data.val];
      }

      return togpx(feature, {
        creator
      });
    }
  }
}