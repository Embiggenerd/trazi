// Import the framework and instantiate it
import Fastify from 'fastify'
import { initCache } from './libs/cache.js'
import { initDB } from './libs/db.js'
import { createPopulationsModel } from './libs/models.js'
import { createHandlers } from './libs/handlers.js'
import { createApp } from './libs/app.js'

export const createConfig = () => ({
    environment: process.env.NODE_ENV,
    populationsFileName: process.env.NODE_ENV === 'test' ? 'population.test.json' : 'population.json',
    port: process.env.NODE_ENV === 'test' ? 5554 : 5555
})
const config = createConfig()

const fastify = Fastify({
    logger: true
})

const db = await initDB(fastify.log, config)
const cache = initCache(fastify.log, db)
const populationModel = createPopulationsModel(db, cache)
const handlers = createHandlers(populationModel, cache)
const app = createApp(fastify, handlers)

try {
    await app.listen({ port: config.port })
} catch (err) {
    app.log.error(err)
    process.exit(1)
}