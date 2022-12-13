/*
 * GeoPicker
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 */

const gdal = require('gdal-async')
    , turf = require('@turf/turf')
    , { densifyGeometry, /*datasetBbox,*/ info } = require('./utils')

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
            return info(rasterdata)
        },
        locPixel: loc => {
            try {
                const { x, y } = transform.transformPoint(loc[0], loc[1])
                return rasterband.pixels.get(x, y)
            } catch (err) {
                console.log(err)
                return null
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
    const { band = 1, epsg = 4326, densify = false } = opts
        ,{ locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band, epsg)

    if (densify !== false) {
        data = densifyGeometry(data, densify)
    }

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

    return data
}
/**
 * get onlye value from data coordinates
 */
function getValue(data, fileData, opts = {}) {
    const { band = 1, epsg = 4326 } = opts
        , { locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band, epsg)

    if (Array.isArray(data[0])) {
        return data.map(locPixel)
    } else {
        return locPixel(data)
    }
}

module.exports = {
    gdal,
    openFile,
    densify: densifyGeometry,
    setValue,
    getValue,
}
