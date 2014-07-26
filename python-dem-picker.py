#!/usr/bin/env python

import web
import json
import geotifreader
from pprint import pprint


demfiles = {
	'dem': 'demfiles/dem.ita.tif',
	'esp': 'demfiles/esp.ita.tif'
}

urls = (
	"/(dem|esp)/", 'latlon2val'
)

app = web.application(urls, globals())

class latlon2val:
	def GET(self, path):
		params = web.input()
		web.header('Content-Type', 'application/json')
		web.header('Server', 'python-dem-picker')
		out = {}

		if params.has_key('lat') and params.has_key('lon'):
			out[path] = geotifreader.latlngFromFile(demfiles[path], float(params.lat), float(params.lon) )
		else:
			out = {'err': 'lat lon params not found'}

		return json.dumps(out)

if __name__ == "__main__":
	app.run()
