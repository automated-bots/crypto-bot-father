import http from 'http'
import process from 'node:process'

const options = {
  host: '127.0.0.1',
  port: '3007',
  path: '/health',
  timeout: 2000
}

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`)
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.exit(1)
  }
})

request.on('error', (err) => {
  console.log('ERROR: ' + err.message)
  process.exit(1)
})

request.end()
