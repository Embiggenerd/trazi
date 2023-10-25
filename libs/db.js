
import { AsyncLocalStorage } from 'async_hooks'
import fs from 'fs'

const getPopulations = (config) => () => fs.readFileSync(`./${config.populationsFileName}`)

const updatePopulations = config => newPopulations => {
    fs.writeFile(`./${config.populationsFileName}`, JSON.stringify(newPopulations), err => {
        if (err) {
            const error = new Error('population could not be persisted')
            error.status = 500
            throw error
        }
    })
}

const dropDB = config => () => {
    fs.unlinkSync(`./${config.populationsFileName}`)
}

export const initDB = async (logger, config) => {
    let populationsJSON = {}
    try {
        const populations = getPopulations(config)()
        populationsJSON = JSON.parse(populations)
    } catch (e) {
        const res = await fetch('https://github.com/Trazi-Ventures/sample-data-interview/blob/main/city_populations.csv')
        if (res.ok) {
            const resJson = await res.json()
            let data = []
            if (resJson.payload.blob.rawLines) {
                data = resJson.payload.blob.rawLines
            } else {
                logger.error(Error('data source not available'))
                process.exit(1)
            }
            data.forEach(d => {
                const dSplit = d.split(',')
                const population = Number(dSplit[dSplit.length - 1])
                const name = dSplit.slice(0, -1).join().toLowerCase().replace(' ', '')
                populationsJSON[name] = population
            })
            try {
                updatePopulations(config)(populationsJSON)
            } catch (err) {
                logger.error(err)
                process.exit(1)
            }
        } else {
            logger.error(Error('failed to fetch populations csv'))
            process.exit(1)
        }
    }
    logger.info('database initialized')
    return({
        populations: populationsJSON,
        updatePopulations: updatePopulations(config),
        getPopulations: getPopulations(config),
        dropDB: dropDB(config)
    })
}