// Import the framework and instantiate it
import Fastify from 'fastify'
// import { errorCodes } from 'fastify'

import fs from 'fs'

const fastify = Fastify({
    logger: true
})

// Write to file for persistence and cache it
// Interrupting server on any fatal error regarding db means the handlers can reasonably assume user error is actually user error
let populationJson = {}
try {
    const population = fs.readFileSync('./population.json')
    populationJson = JSON.parse(population)
} catch (e) {
    fetch('https://github.com/Trazi-Ventures/sample-data-interview/blob/main/city_populations.csv')
        .then(async res => {
            if (res.ok) {
                const resJson = await res.json()
                let data = []
                if (resJson.payload.blob.rawLines) {
                    data = resJson.payload.blob.rawLines
                } else {
                    fastify.log.error(Error('data source not available'))
                    process.exit(1)
                }
                data.forEach(d => {
                    const dSplit = d.split(',')
                    const population = Number(dSplit[dSplit.length - 1])
                    const name = dSplit.slice(0, -1).join().toLowerCase().replace(' ', '')
                    populationJson[name] = population
                })
                fs.writeFile('./population.json', JSON.stringify(populationJson), err => {
                    if (err) {
                        fastify.log.error(err)
                        process.exit(1)
                    }
                })
            } else {
                fastify.log.error(Error('failed to fetch populations csv'))
                process.exit(1)
            }
        })
} finally {
    fastify.log.info('database initialized and cached')
}


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