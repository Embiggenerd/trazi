
import fs from 'fs'

export const initDB = (fastify) => {
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
    return populationJson
}