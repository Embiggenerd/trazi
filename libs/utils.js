export const normalizeCityState = (city, state) => `${city},${state}`.replace(' ', '').toLowerCase()
export const validatePopulationsParams = ({city, state}) => {
    if (city === "" || city === undefined) {
        const error = new Error("request is missing city")
        error.status = 400
        throw error
    }
    if (state === "" || state === undefined) {
        const error = new Error("request is missing state")
        error.status = 400
        throw error
    }        
    return {city, state}
}
export const validatePopulansBody = (body) => {
    if (body === "" || body === undefined) {
        const error = new Error("request is missing a body")
        error.status = 400
        throw error
    }    
    return body   
}