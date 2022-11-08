#!/usr/bin/env python


from osgeo import gdal,ogr
from osgeo.gdalconst import *
import struct
import sys

def pt2fmt(pt):
	fmttypes = {
		GDT_Byte: 'B',
		GDT_Int16: 'h',
		GDT_UInt16: 'H',
		GDT_Int32: 'i',
		GDT_UInt32: 'I',
		GDT_Float32: 'f',
		GDT_Float64: 'f'
		}
	return fmttypes.get(pt, 'x')

def latlngFromFile(filename, lat, lon):
	ds = gdal.Open(filename, GA_ReadOnly)
	if ds is None:
		return false

	transf = ds.GetGeoTransform()
	cols = ds.RasterXSize
	rows = ds.RasterYSize
	bands = ds.RasterCount #1
	band = ds.GetRasterBand(1)
	bandtype = gdal.GetDataTypeName(band.DataType) #Int16
	driver = ds.GetDriver().LongName #'GeoTIFF'

	success, transfInv = gdal.InvGeoTransform(transf)
	if not success:
		print "Failed InvGeoTransform()"
		sys.exit(1)

	px, py = gdal.ApplyGeoTransform(transfInv, lon, lat)

	structval = band.ReadRaster(int(px), int(py), 1,1, buf_type = band.DataType )

	fmt = pt2fmt(band.DataType)

	intval = struct.unpack(fmt , structval)

	return round(intval[0], 2) #intval is a tuple, length=1 as we only asked for 1 pixel value


def locsFromFile(filename, locs):
	ds = gdal.Open(filename, GA_ReadOnly)
	if ds is None:
		return false

	transf = ds.GetGeoTransform()
	cols = ds.RasterXSize
	rows = ds.RasterYSize
	bands = ds.RasterCount #1
	band = ds.GetRasterBand(1)
	bandtype = gdal.GetDataTypeName(band.DataType) #Int16
	driver = ds.GetDriver().LongName #'GeoTIFF'

	success, transfInv = gdal.InvGeoTransform(transf)
	if not success:
		print "Failed InvGeoTransform()"
		sys.exit(1)

	vals = []
	for loc in locs:
		px, py = gdal.ApplyGeoTransform(transfInv, loc[1], loc[0])

		structval = band.ReadRaster(int(px), int(py), 1,1, buf_type = band.DataType )

		fmt = pt2fmt(band.DataType)

		intval = struct.unpack(fmt , structval)

		vals.append( round(intval[0], 2) )

	return vals

if __name__ == "__main__":

	lat = 42.243713
	lon = 12.502742

	if len(sys.argv) > 2:
		lat = float(sys.argv[2])
	if len(sys.argv) > 3:
		lon = float(sys.argv[3])

	val = latlngFromFile(sys.argv[1], lat, lon)

	if val is None:
		print "Failed open file"
		sys.exit(1)
	else:
		print "Value piked: %d" % val
