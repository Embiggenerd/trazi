import { normalizeCityState } from "./utils.js"

export const initCache = (logger, db) => {
    const populations = { ...db.populations }
    logger.info('cache initialized')
    return {
        populations,
        getCityStatePopulation: (city, state) => {
            return populations[normalizeCityState(city, state)]
        },
        setCityStatePopulation: (city, state, population) => {
            populations[normalizeCityState(city, state)] = population
            return populations
        }
    }
}