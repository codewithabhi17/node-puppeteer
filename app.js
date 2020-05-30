var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerDoc = require('./routes/swaggerDoc');
var config = require('./config/config.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = config.log4j.loggerLevel;
var fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 //2MB max file(s) size
  },
}));

app.use('/', indexRouter);
// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

swaggerDoc(app);
app.listen(config.properties.appPort, () => logger.debug(`app listening on port ${config.properties.appPort}!`));
module.exports = app;
