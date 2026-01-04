
const isoline = require('./isoline');
const mooreNeighbor = require('./moore-neighbor');
const claude = require('./claude');

module.exports = async fastify => {

  const {datasetDefault, utils: {contourLines, simplifyLocations}} = fastify

  fastify.get('/:datasetId/contour/:lon/:lat', {/*schema: schemas.lonlatGet*/}, async req => {
      //return contourLines(datasetDefault, req.data);

      const loc = req.data;

      const feature = await claude('./tests/data/alps_dem_90m.tif', loc);

      // const feature = await isoline(datasetDefault, loc);
      // //const feature = await mooreNeighbor('./tests/data/test_4611_dem.tif', loc);

      return {
        type: "FeatureCollection",
        features: [feature] 
      }
  });
}