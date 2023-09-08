/*
 * GeoPicker
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const gdal = require('gdal-async')
    , turf = require('@turf/turf')
    , package = require(`${__dirname}/../package.json`)
    , utils = require('./utils')
    , { datasetInfo, parseLocations } = utils

/**
 * open File dataset file and return methods to read
 * docs: https://mmomtchev.github.io/node-gdal-async/
 */
function openFile(fileData, band = 1) {
    const dataset = gdal.open(fileData)
        , rasterband = dataset.bands.get(band)
        , info = datasetInfo(dataset, band, fileData)
        , crs = gdal.SpatialReference.fromEPSG(info.epsg)
        , transform = new gdal.CoordinateTransformation(crs, dataset)

    return {
        info,
        locPixel: loc => {
            try {
                const { x, y } = transform.transformPoint(Number(loc[0]), Number(loc[1]))
                return rasterband.pixels.get(x, y);
            }
            catch (err) {
              if (err.message.includes('out of range')) {
                //TODO set error code
                throw new Error('location pixel out of dataset bounds')
              }
            }
        },
        close: () => {
          dataset.close()
        }
    }
}

/**
 * get only value by data coordinates
 */
function getValue(data, fileData, opts = {}) {
    const { band = 1, sepLocs = '|', sepCoords = ','} = opts
        , { locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band)

    if (typeof data === 'string') {
        return parseLocations(data, sepLocs, sepCoords).map(locPixel)
    }
    else if (Array.isArray(data[0])) {
        return data.map(locPixel)
    }
    else if (Array.isArray(data)) {  //single loc
        return locPixel(data);
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
    const { band = 1 } = opts
        , { locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band)

    if (Array.isArray(data[0])) { //array of coordinates
      data.forEach(loc => {
        loc.push(locPixel(loc));
      });
    }
    else if (data.lon && data.lat) {  //point
      data.val = locPixel([data.lon, data.lat]);
    }
    else if (data.coordinates || data.geometry || data.features) {  //geojson

      turf.coordEach(data, loc => {
          loc.push(locPixel(loc))
      });
    }

    return data
}

module.exports = {
    package,
    gdal,
    turf,
    utils,
    openFile,
    getValue,
    setValue
}
