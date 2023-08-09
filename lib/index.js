/*
 * GeoPicker
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const gdal = require('gdal-async')
    , turf = require('@turf/turf')
    , { densifyGeometry, datasetInfo, coordPrecision, /*locPrecision, datasetBbox, datasetContains*/ } = require('./utils')

/**
 * open File dataset file and return methods to read
 */
function openFile(fileData, band, epsg) {
    const rasterdata = gdal.open(fileData)
        , rasterband = rasterdata.bands.get(band)
        , crs = gdal.SpatialReference.fromEPSG(epsg)
        , transform = new gdal.CoordinateTransformation(crs, rasterdata)

    return {
        info: () => {
            return datasetInfo(rasterdata)
        },
        locPixel: loc => {
            try {
                const { x, y } = transform.transformPoint(loc[0], loc[1])
                return rasterband.pixels.get(x, y);
            } catch (err) {
              if (err.message.includes('out of range')) {
                throw new Error('location pixel out of dataset bounds')
              }
            }
        },
        close: () => {
          rasterdata.close()
        }
    }
}

/**
 * set Values in object passed
 */
function setValue(data, fileData, opts = {}) {
    const { band = 1, epsg = 4326, densify = false, precision = null } = opts
        ,{ locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band, epsg)

    if (densify !== false) {
      data = densifyGeometry(data, densify)
    }

    if (precision===null) { // TODO refact removing replication code

      if(Array.isArray(data[0])) { //array of coordinates
        data.forEach(loc => {
          loc.push(locPixel(loc));
        });
      }
      else if(data.lon && data.lat) {
        data.val = locPixel([data.lon, data.lat]);
      }
      else if (data.coordinates) { // is Geometry

        // TODO manage FeatureCollection | Feature

        turf.coordEach(data, loc => {
            loc.push(locPixel(loc))
        });
      }

    } else {

      if(Array.isArray(data[0])) { //array of coordinates
        data.forEach(loc => {
          loc[0] = coordPrecision(loc[0], precision);
          loc[1] = coordPrecision(loc[1], precision);
          loc.push(locPixel(loc));
        });
      }
      else if(data.lon && data.lat) {
        data.lon = coordPrecision(data.lon, precision)
        data.lat = coordPrecision(data.lat, precision)
        data.val = locPixel([data.lon, data.lat]);
      }
      else if(data.longitude && data.latitude) {
        data.longitude = coordPrecision(data.longitude, precision)
        data.latitude = coordPrecision(data.latitude, precision)
        data.value = locPixel([data.longitude, data.latitude]);
      }
      else if (data.coordinates) { // is Geometry

        // TODO manage FeatureCollection | Feature

        turf.coordEach(data, loc => {
            loc[0] = coordPrecision(loc[0], precision);
            loc[1] = coordPrecision(loc[1], precision);

            // FIX ME coordPrecision dont work
            //
            loc.push(locPixel(loc));
        });
      }
    }

    return data
}

/**
 * get only value from data coordinates
 */
function getValue(data, fileData, opts = {}) {
    const { band = 1, epsg = 4326 } = opts
        , { locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band, epsg)

    if (Array.isArray(data[0])) {
        return data.map(locPixel)
    }
    else if (Array.isArray(data)) {
        return locPixel(data)
    }
    else {
      throw new Error('getValue accept an array of locations')
    }
}

module.exports = {
    gdal,
    openFile,
    setValue,
    getValue,
    densify: densifyGeometry
}
