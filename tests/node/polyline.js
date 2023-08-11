const readline = require('readline');
const polyline = require('@mapbox/polyline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const lines = []
rl.on('line', line => {
  lines.push(line);
});

rl.on('close', () => {
  const input = lines.join('')


  let out = '';

  if (process.argv[2]==='-e') {
    const json = JSON.parse(input)

    json.forEach(e => {
      //random Z dimension
      e.push(Math.floor(1000*Math.random()))
    })
    //console.log(json)
    out = polyline.encode(json)
  }
  else if (process.argv[2]==='-d') {
    out = polyline.decode(input)
  }

  console.log(out)
});