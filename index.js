// Import the framework and instantiate it
import Fastify from 'fastify'
import { initDB } from './libs/db.js'

const fastify = Fastify({
    logger: true
})

const db =  initDB(fastify)
// const services = buildServices(db)

fastify.get('/api/population/state/:state/city/:city', function handler(request, reply) {
    const { state, city } = request.params
    const name = `${city},${state}`.replace(' ', '').toLowerCase()
    const population = populationJson[name]
    if (population === undefined) {
        reply
            .code(400)
            .type('text/plain')
            .send('state or city can not be processed')
        return
    }
    reply
        .code(200)
        .type('application/json')
        .send({ population })
})

fastify.put('/api/population/state/:state/city/:city', function handler(request, reply) {
    let statusCode = 200
    const { state, city } = request.params
    const body = Number(request.body)
    if (isNaN(body) || body === undefined) {
        reply
            .code(400)
            .type('text/plain')
            .send('state or city can not be processed')
        return
    }
    const name = `${city},${state}`.replace(' ', '').toLowerCase()
    const populationCurrent = populationJson[name]
    if (populationCurrent === undefined) {
        statusCode = 201
    }
    populationJson[name] = body
    fs.writeFile('./population.json', JSON.stringify(populationJson), err => {
        if (err) {
            fastify.log.error(err)
            reply
                .code(500)
                .type('text/plain')
                .send('population could not be persisted')
            return
        }
    })
    reply
        .code(statusCode)
        .type('text/plain')
        .send('1')
})


try {
    await fastify.listen({ port: 5555 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}