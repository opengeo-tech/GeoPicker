/*
 * GeoPicker
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const gdal = require('gdal-async')
    , turf = require('@turf/turf')
    , utils = require('./utils')
    , { densifyGeometry, datasetInfo, parseLocations } = utils

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
 * get only value by data coordinates
 */
function getValue(data, fileData, opts = {}) {
    const { band = 1, epsg = 4326, sepLocs = '|', sepCoords = ','} = opts
        , { locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band, epsg)

    if (typeof data === 'string') {
        return parseLocations(data, sepLocs, sepCoords).map(locPixel)
    }
    else if (Array.isArray(data[0])) {
        return data.map(locPixel)
    }
    else if (Array.isArray(data)) {
        return locPixel(data)
    }
    //FIX for data.lon === 0 use typeof
    else if (data.lon && data.lat) {
        return locPixel([data.lon, data.lat]);
    }
    else {
      throw new Error('getValue accept an array of locations')
    }
}

/**
 * set Values in object data
 */
function setValue(data, fileData, opts = {}) {
    const { band = 1, epsg = 4326, densify = false } = opts
        , { locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band, epsg)

    if (densify !== false) {
      data = densifyGeometry(data, densify)
    }

    //TODO new param format: input,json,array,geojson

    if (Array.isArray(data[0])) { //array of coordinates
      data.forEach(loc => {
        loc.push(locPixel(loc));
      });
    }
    else if (data.lon && data.lat) {
      data.val = locPixel([data.lon, data.lat]);
    }
    else if (data.coordinates || data.geometry || data.features) {

      turf.coordEach(data, loc => {
          loc.push(locPixel(loc))
      });
    }

    return data
}

module.exports = {
    gdal,
    turf,
    utils,
    openFile,
    getValue,
    setValue
}
