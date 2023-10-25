export const createApp = (fastify, { getPopulationHandler, putPopulationHandler } ) => {
    fastify.get('/api/population/state/:state/city/:city', getPopulationHandler)
    fastify.put('/api/population/state/:state/city/:city', putPopulationHandler)
    return fastify
}