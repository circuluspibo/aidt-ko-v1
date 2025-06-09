const f = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const path = require('node:path')

f.register(cors, {
  origin: true
});

f.register(require('@fastify/static'), {
  root: path.join(__dirname, 'web'),
  prefix: '/', // optional: default '/'
  //constraints: { host: 'example.com' } // optional: default {}
})

// Declare a route
f.get('/test', function handler (request, reply) {
  reply.send({ hello: 'world' })
})

// Run the server!
f.listen({ ip: '0.0.0.0', port: 9999 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})