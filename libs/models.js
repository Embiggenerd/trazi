import { normalizeCityState } from "./utils.js"

export const createPopulationsModel = (populationsDB, populationsCache) => ({
    getCityStatePopulation: (city, state) => {
        const name = normalizeCityState(city, state)
        const population = populationsCache.getCityStatePopulation(name)
        if (population === undefined) {
            const error = new Error('state or city can not be processed')
            error.statusCode = 400
            throw error
        }
        return population
    },

    setCityStatePopulation: (city, state, newPopulation) => {
        const name = normalizeCityState(city, state)
        const newPopulations = populationsCache.setCityStatePopulation(name, newPopulation)
        populationsDB.updatePopulations(newPopulations)
        return {}
    }
})
