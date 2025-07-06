//TODO convert in full geojson, feature/geometry/collection by input

module.exports = fastify => {;

  const {utils: {parseLocations}} = fastify;

  const mimeType = 'application/geo+json';

  return {
    'geojson': {
        mimeType,
        read: (data, req) => {
            return data
        },
        write: (data, req) => {

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
                const locations = parseLocations(req.params.locations);
                locations.forEach((loc, k) => {
                    loc.push(data[k])
                });
                feature.geometry.coordinates = locations;
                }
                else {                           //location array in POST body
                feature.geometry.coordinates = data;
                }
            }
            else if (data.coordinates || data.geometry) {
                feature = data;
            }
            else if (data.lon && data.lat && data.val) {
                feature.geometry.type = 'Point';
                feature.geometry.coordinates = [data.lon, data.lat, data.val];
            }

            return JSON.stringify(feature);
        }
    }
  }
}
