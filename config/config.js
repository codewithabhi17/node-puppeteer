module.exports = {
    properties: {
        appPort: process.env.APP_PORT || "3001"
    },
    swagger:{
        basePath: process.env.SWAGGER_BASE_PATH || '/'
    },
    log4j:{
        loggerLevel: process.env.LOGGER_LEVEL || 'debug'
    }
}