/*
 * GeoPicker
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 */
// TODO maybe... https://github.com/caseycesari/geojson.js

const gdal = require('gdal-async')
    ,turf = require('@turf/turf')
    ,{ densifyGeometry, info } = require('./utils')

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

function setValue(geojson, fileData, opts = {}) {
    const { band = 1, epsg = 4326, densify = false } = opts
        ,{ locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band, epsg)

    if (densify !== false) {
        geojson = densifyGeometry(geojson, densify)
    }

    // FeatureCollection | Feature | Geometry
    turf.coordEach(geojson, async (loc) => {
        loc.push(locPixel(loc))
    })

    return geojson
}

function getValue(locs, fileData, opts = {}) {
    const { band = 1, epsg = 4326 } = opts
        ,{ locPixel } = fileData.locPixel
            ? fileData
            : openFile(fileData, band, epsg)

    if (locs.length > 2) {
        return locs.map(locPixel)
    } else {
        return locPixel(locs)
    }
}

module.exports = {
    gdal,
    openFile,
    densify: densifyGeometry,
    setValue,
    getValue,
}
