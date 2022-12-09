
const autocannon = require('autocannon')

autocannon({
  url: 'http://localhost:9090/default/11.11111/46.22222',
  connections: 10, //default
  pipelining: 1, // default
  duration: 10 // default
}, console.log)
