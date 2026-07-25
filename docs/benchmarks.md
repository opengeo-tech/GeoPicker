
# Benchmarks

## HTTP throughput (autocannon)

Benchmarks scripts: `tests/benchmarks.js` using [AutoCannon](https://github.com/mcollina/autocannon)

```bash
cd tests && npm install && cd -
npm run bench
```

The results testing a dataset of 2x2km [geotiff](https://github.com/opengeo-tech/geopicker/blob/master/tests/data/test_4611_dem.tif)
```
┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬──────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max  │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼──────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 1 ms │ 0.02 ms │ 0.16 ms │ 6 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴──────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Req/Sec   │ 18111   │ 18111   │ 22783   │ 23471   │ 22175.28 │ 1473.21 │ 18099   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Bytes/Sec │ 4.02 MB │ 4.02 MB │ 5.05 MB │ 5.21 MB │ 4.92 MB  │ 327 kB  │ 4.01 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

244k requests in 11.01s, 54.1 MB read
```

## Dataset handle memory footprint

Since `server/plugins/datasets.js` now keeps one open GDAL handle per configured dataset (instead of only the default one) for the whole lifetime of the server, it's worth knowing how much memory each open handle actually costs.

### What a handle is

`gpicker.openFile(file, band)` (`lib/geopicker.js`) returns a plain object:
```js
{
  info,          // small JS object: bbox, centroid, pixelSize, stats... (~400 bytes as JSON)
  dataset,       // gdal-async Dataset — native wrapper around a GDALDataset
  rasterband,    // gdal-async RasterBand — native wrapper around a GDALRasterBand
  geoTransform,  // gdal.CoordinateTransformation instance
  locPixel,      // closure reading a pixel value
  close,         // closure calling dataset.close()
}
```
None of these hold the raster data itself in the JS object — `dataset`/`rasterband`/`geoTransform` are thin references to native GDAL C++ objects.

### Method

Measured `process.memoryUsage().rss` (Node 18.20.8) before/after opening handles for two sample datasets from `tests/data/`, then after 1000 `locPixel()` calls at random coordinates:

```js
const gpicker = require('./lib/geopicker');
const h1 = gpicker.openFile('./tests/data/alps_dem_10m.tif', 1);              // fine resolution (10m)
const h2 = gpicker.openFile('./tests/data/trentino-altoadige_dem_90m.tif', 1); // coarser resolution (90m)
for (let i = 0; i < 1000; i++) h1.locPixel([11 + Math.random()*0.1, 46 + Math.random()*0.1]);
```

### Results

| Step | RSS | Delta |
|------|-----|-------|
| baseline (node + gdal-async loaded) | 88.32 MB | — |
| after opening `alps_dem_10m.tif` (10m res.) | 95.13 MB | +6.8 MB |
| after opening `trentino-altoadige_dem_90m.tif` (90m res.) | 95.58 MB | +0.45 MB |
| after 1000 random `locPixel()` reads | 109.39 MB | +13.8 MB |

`JSON.stringify(handle.info).length` = 424 bytes — confirms the JS-visible metadata is negligible.

### Takeaways

- **Opening cost is proportional to raster resolution, not file size.** `datasetInfo()` calls `rasterband.getStatistics(true, true)`, which forces GDAL to scan the band for min/max/mean if not already cached in a sidecar `.aux.xml`. The 10m DEM (many more pixels) costs ~15x more to open than the 90m DEM covering a comparable area.
- **Reads add up via GDAL's own block cache**, not via the JS handle object. GDAL keeps a single cache shared across all open datasets (size capped by `GDAL_CACHEMAX`, default ~5% of system RAM), so memory from reads doesn't grow unbounded and isn't duplicated per handle.
- **The real per-handle cost to watch is native objects/file descriptors, not RAM.** Config aliases (e.g. `altitude`/`trentino`/`elevation` all pointing at the same file in `server/config.yml`) currently each get their own `gpicker.openFile()` call in `server/plugins/datasets.js`, i.e. separate native `Dataset`/`CoordinateTransformation` instances and file descriptors for the same underlying file. Harmless at the current scale (a handful of aliases), but worth deduplicating by resolved file path + band if the dataset list grows significantly.
