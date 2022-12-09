#!/usr/bin/env python

import web
import json
import geotifreader
from pprint import pprint


tiffs = {
	'dem': 'tiffs/dem.ita.tif',
	'esp': 'tiffs/esp.ita.tif'
}

urls = (
	"/(dem|esp)/",
	"latlon2val"
)

app = web.application(urls, globals())

class latlon2val:
	def GET(self, path):
		params = web.input()
		web.header('Content-Type', 'application/json')
		web.header('Server', 'python-geopicker')
		out = {}

		if params.has_key('lat') and params.has_key('lon'):
			out[path] = geotifreader.latlngFromFile(tiffs[path], float(params.lat), float(params.lon) )

		elif params.has_key('locs'):
			locs = [[float(c) for c in ll.split(',')] for ll in params.locs.split('|')]
			out[path] = geotifreader.locsFromFile(tiffs[path], locs)

		else:
			out = {'err': 'latl,gon or locs params not found'}

		return json.dumps(out)

if __name__ == "__main__":
	app.run()
