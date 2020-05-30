module.exports = {
    properties: {
        appPort: process.env.DRS_PDF_APP_PORT || "3001"
    },
    htmlSanitizer:{
        htmlSanitizerProperties: "{\"allowedTags\": [\"html\",\"head\",\"style\",\"anchor\",\"body\",\"header\",\"h1\",\"h2\",\"h3\",\"h4\",\"h5\",\"h6\",\"footer\",\"div\",\"img\",\"table\",\"tr\",\"td\",\"th\",\"thead\",\"tbody\",\"br\",\"strong\",\"span\",\"p\",\"i\",\"b\",\"em\",\"mark\",\"small\",\"del\",\"ins\",\"sub\",\"sup\",\"bold\"],\"disallowedTagsMode\": \"discard\",\"allowedAttributes\": false,\"allowedSchemes\": [\"data\"]}"
    },
    swagger:{
        basePath: process.env.SWAGGER_BASE_PATH = '/'
    },
    log4j:{
        loggerLevel: process.env.LOGGER_LEVEL = 'debug'
    }
}