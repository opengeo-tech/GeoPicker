const gdal = require('gdal-async')
    , turf = require('@turf/turf');

const simplifyLocations = require('./simplify');

/**
 * generate contour line for a given location value
 * @param {String} src gdal dataset
 * @param {Object} value point
 * @param {String} attributeName attribute name to store the value
 * @return {Object} GeoJSON FeatureCollection
 */
module.exports = async function contourLines(dataset, loc, bbox) {

  const value = dataset.locPixel(loc);
  const features = [];

  if (value !== null) {
  
    const src = dataset.rasterband;
    const geoTransform = dataset.dataset.geoTransform;

////CROP DATASET AROUND POINT TO IMPROVE PERFORMANCE
    const halfSize = 30 // Calculate bounding box of halfSize pixels around loc
        , pixelCoords = dataset.geoTransform.transformPoint(Number(loc[0]), Number(loc[1]))
        , xCenter = Math.round(pixelCoords.x)
        , yCenter = Math.round(pixelCoords.y)
        , xOffset = Math.max(0, xCenter - halfSize)
        , yOffset = Math.max(0, yCenter - halfSize)
        , xSize = Math.min(halfSize * 2, src.ds.rasterSize.x - xOffset)
        , ySize = Math.min(halfSize * 2, src.ds.rasterSize.y - yOffset)

    const memDriver = gdal.drivers.get('MEM')
        , memDs = memDriver.create('', xSize, ySize, 1, src.dataType);

    const newGeoTransform = [...geoTransform];
    newGeoTransform[0] = geoTransform[0] + xOffset * geoTransform[1];
    newGeoTransform[3] = geoTransform[3] + yOffset * geoTransform[5];
    memDs.geoTransform = newGeoTransform;

    memDs.srs = src.ds.srs;
    const cropBand = memDs.bands.get(1);
    cropBand.noDataValue = src.noDataValue;
    // Read subset and write to clipper
    const data = await src.pixels.readAsync(xOffset, yOffset, xSize, ySize);
    await cropBand.pixels.writeAsync(0, 0, xSize, ySize, data);
//END CROP DATASET

    const vector = gdal.open('temp', 'w', 'Memory')
    const isolayer = vector.layers.create('temp', null, gdal.LineString);

    // https://mmomtchev.github.io/node-gdal-async/#contourgenerateasync
    gdal.contourGenerate({
      src: cropBand,
      dst: isolayer,
      fixedLevels: value // Array.from(rangeAround(value)),
    });

    isolayer.features.forEach(feature => {
      const geometry = feature.getGeometry().toObject();
      
      simplifyLocations(geometry, 0.00005);

      if (turf.booleanPointOnLine(turf.point(loc), geometry, {epsilon: 0.000001})) {
        features.push({
          type: 'Feature',
          geometry
        });
        //features.push(geometry.coordinates)
      }
    });

    vector.close();
    memDs.close();
  }

  return {
    type: 'FeatureCollection', features
  };
}