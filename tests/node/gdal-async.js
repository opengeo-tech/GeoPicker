
const { gdal, utils:{ datasetInfo } } = require('../../lib')

const {resolve} = require('path')
const glob = require('glob');

const cwd = process.argv[2];


function openFile(fileData) {
    const rasterdata = gdal.open(fileData)
        , rasterband = rasterdata.bands.get(1)
        , crs = gdal.SpatialReference.fromEPSG(4326)
        , transform = new gdal.CoordinateTransformation(crs, rasterdata)

    return {
        info: () => {
            return datasetInfo(rasterdata)
        },
        close: () => {
          rasterdata.close()
        }
    }
}

//const files = [...Array(4).keys()]
glob('**/*.tif', {cwd}, (err, files) => {

    const timer = setInterval(() => {

        const filename = files.pop()

        if (!filename) {
            //clearInterval(timer);
            return
        }
        const file = resolve(cwd, filename)
        //const info = openFile(file).info()

        gdal.open(file)

        console.log(`open file ${file}`)

    }, 100)
});
