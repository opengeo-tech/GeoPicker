
const togpx = require('togpx');

module.exports = fastify => {
  const {package} = fastify
      , creator = `Geopicker v${package.version} - ${package.homepage}`;

  const mimeType = 'application/gpx+xml';

  return {
    'gpx': {
        mimeType,
        read: (data, req) => {
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
        write: (payload, req) => {

            const data = JSON.parse(payload)

            let feature = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
                };

            if (Array.isArray(data)) {
                const {lon, lat} = req.data;

                if (data.length === 1) {
                    feature.geometry.type = 'Point';
                    feature.geometry.coordinates = [lon, lat, data[0]];
                }
                else if (data.length > 1) {
                    const locs = req.data
                    locs.forEach((loc, k) => {
                        loc.push(data[k])
                    });
                    feature.geometry.coordinates = locs;
                }
                else {                         //location array in POST body
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
}
