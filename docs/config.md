
# Configuration

## Datasets

```yaml
datapath: '/data'
datasets:
  default: elevation
  #aliases of same dataset
  dem: elevation
  ele: elevation
  elevation:
    path: trentino-altoadige_dem_90m.tif
    band: 1
  aspect:
    path: trentino-altoadige_dem_90m.tif
    band: 2
  slope:
    path: trentino-altoadige_slope_90m.tif
```