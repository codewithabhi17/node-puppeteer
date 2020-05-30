var express = require('express');
var router = express.Router();
const logger = require('log4js').getLogger();

/* GET home page. */
router.get('/generatepdf', function(req, res, next) {
  logger.debug('Lets generate PDF together!');
  res.send({
    status: false,
    message: 'First Medium Project.'
  });
  return
});

module.exports = router;
