#!/usr/bin/env python

import web
import json
import geotifreader

demfiles = {
	'dem': 'demfiles/dem.ita.tif',
	'esp': 'demfiles/esp.ita.tif'
}

urls = (
	'/dem/(.*)', 'dem'
)

app = web.application(urls, globals())

class dem:        
	def GET(self, path):
		params = web.input()
		web.header('Content-Type', 'application/json')
		
		if params.has_key('lat') and params.has_key('lon'):
			val = geotifreader.latlngFromFile(demfiles['dem'], float(params.lat), float(params.lon) )
			return json.dumps({'dem': val})
		else:
			return json.dumps({'err': 'lat lon params not found'})

if __name__ == "__main__":
	app.run()
