/*
 * GeoPicker
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const gdal = require('gdal-async')
    , turf = require('@turf/turf')
    , package = require(`${__dirname}/../package.json`)
    , utils = require('./utils')
    , { datasetInfo } = utils

/**
 * open File dataset file and return methods to read
 * docs: https://mmomtchev.github.io/node-gdal-async/
 */
function openFile(fileData, band = 1) {
    //TODO maintain index of opened files and each have own transform and info
    const dataset = gdal.open(fileData)
        , rasterband = dataset.bands.get(band)
        , info = datasetInfo(dataset, band, fileData)
        , crs = gdal.SpatialReference.fromEPSG(info.epsg)
        , transform = new gdal.CoordinateTransformation(crs, dataset);

    return {
        info,
        locPixel: loc => {
            try {
                const { x, y } = transform.transformPoint(Number(loc[0]), Number(loc[1]))
                //TODO getAsync https://mmomtchev.github.io/node-gdal-async/#getasync-1
                return rasterband.pixels.get(x, y);
            }
            catch (err) {
              if (err.message.includes('out of range')) {
                //TODO set error code, manae in server
                //throw new Error('location out of dataset bounds')
                return null
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
    const { band = 1 } = opts
        , { locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band)

    if (Array.isArray(data[0])) {  //array of coordinates /:datasetId/:locations
        return data.map(locPixel)
    }
    else if (Array.isArray(data)) {  //single loc /:datasetId/:lon/:lat
        return [locPixel(data)];
    }
    else {
        //throw new Error('getValue accept an array of locations')

        //TODO turf.coordEach like esetValue

        return [null]
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
    else if (Array.isArray(data)) {  //single loc array in Post body
        data.push(locPixel(data));
    }
    else if (Object.hasOwn(data,'lon') && Object.hasOwn(data,'lat')) {  //single loc obj in Post body
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
    openFile,
    getValue,
    setValue,
    package,
    utils,
    gdal,
    turf,
}
