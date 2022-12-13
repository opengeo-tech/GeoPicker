
const geoblaze = require('geoblaze');
const fs = require('fs');

const file = process.argv[2] || './data/trentino-altoadige_90m.tif';

const point = {
	"type": "Point",
	"coordinates": [
	  11.0,
	  46.0
	]
}

fs.readFile(file, async (err,data) => {

	const geo = await geoblaze.parse(data);
	//const geo = await geoblaze.load(data);
	const res = await geoblaze.identify(geo, point)

	console.log(res)

});
