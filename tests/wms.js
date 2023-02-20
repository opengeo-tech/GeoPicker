/*
 * GeoPicker
 * Copyright Stefano Cudini stefano.cudini@gmail.com
 * https://opengeo.tech
 */
const gdal = require('gdal-async')
    , turf = require('@turf/turf')
    , { datasetInfo } = require('../lib/utils')

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


const i = openFile(process.argv[1]).info()

console.log(process.argv[2], i)
