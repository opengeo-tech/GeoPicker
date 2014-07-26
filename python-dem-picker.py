
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
		val = geotifreader.latlngFromFile(demfiles['dem'], float(params.lat), float(params.lon) )
		return json.dumps({'dem': val})

if __name__ == "__main__":
	app.run()
