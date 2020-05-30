var express = require('express');
var swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./config/swagger.yaml');
var authConfig = require('../config/config.js');
var app = express();

module.exports = (app) => {
    swaggerDocument.basePath=authConfig.swagger.basePath || swaggerDocument.basePath;
    app.use('/swagger-ui.html', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}