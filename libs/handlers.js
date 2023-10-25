import { validatePopulansBody, validatePopulationsParams } from "./utils.js"

const getPopulationHandler = (cache) => (request, reply) => {
    try {
        const { state, city } = validatePopulationsParams(request.params)
        const population = cache.getCityStatePopulation(city, state)
        if (population === undefined) {
            const error = new Error('state or city can not be processed')
            error.status = 400
            throw error
        }
        reply
            .code(200)
            .type('application/json')
            .send({ population })
    } catch (e) {
        reply
            .type('text/plain')
            .send(e)
    }
}

const putPopulationHandler = (populationsModel, cache) => (request, reply) => {
    try {
        let statusCode = 200
        const { state, city } = validatePopulationsParams(request.params)
        const newPopulation = Number(validatePopulansBody(request.body))
        if (isNaN(newPopulation)) {
            const error = new Error('population can not be processed')
            error.status = 400
            throw error
        }
        const currentPopulation = cache.getCityStatePopulation(city, state)
        if (currentPopulation === undefined) {
            statusCode = 201
        }
        cache.setCityStatePopulation(city, state, newPopulation)
        populationsModel.setCityStatePopulation(city, state, newPopulation)
        reply
            .code(statusCode)
            .type('text/plain')
            .send('1')
    } catch (e) {
        reply
            .type('text/plain')
            .send(e)
    }
}

export const createHandlers = (populationsModel, cache) => ({
    getPopulationHandler: getPopulationHandler(cache),
    putPopulationHandler: putPopulationHandler(populationsModel, cache)
})