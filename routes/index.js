var express = require('express');
var router = express.Router();
var puppeteer = require('puppeteer');
var handlebars = require('handlebars');
//required if you are using handle bar helper functions
require('handlebars-helpers')();
var uuid = require('uuid-random');
var path = require('path');
var config = require('../config/config.js');
var logger = require('log4js').getLogger();

router.post('/generatepdf', function (req, res, next) {
    //add any validation if required here.
    generatePdf(req, res);
});

function generatePdf(req, res) {
    //wrap inside a try block
    try {
        //if html template is not provided throw an error message
        if (!req.files || !req.files.htmlTemplateFile) {
            res.status = 400;
            logger.debug('Html template file not uploaded');
            res.send({
                status: false,
                message: 'Html template file not uploaded'
            });
            return
        } else {
            //if provided html template file doesn't have the .html extension throw an error message
            var filePathExtension = path.extname(req.files.htmlTemplateFile.name)
            if (filePathExtension !== '.html') {
                logger.error('Invalid html file uploaded');
                res.send({
                    status: false,
                    message: 'Invalid html file uploaded'
                });
                return
            }
        }
        //if json data is not provided throw an error message
        if (!req.files.jsonData) {
            res.status = 400;
            logger.error('json data not provided');
            res.send({
                status: false,
                message: ' json data not provided'
            });
            return
        } else {
            //if provided json file doesn't have the .json extension throw an error message
            var filePathExtension = path.extname(req.files.jsonData.name)
            if (filePathExtension !== '.json') {
                logger.error('Invalid json file uploaded');
                res.send({
                    status: false,
                    message: 'Invalid json file uploaded'
                });
                return
            }
        }
        //convert html to string for processing
        file = req.files.htmlTemplateFile.data.toString();
        //parse the json file using JSON.parse library
        const jsonData = JSON.parse(req.files.jsonData.data);
        //you can either request for pdf output or html output depending on your choice.
        //supported values are html/pdf. defaulting it to pdf
        var reportFileFormat;
        if(!req.body.reportFormatType){
           reportFileFormat = 'pdf'
        }else{
          reportFileFormat = req.body.reportFormatType
        }
        if (reportFileFormat == 'pdf') {
            fileName = `${uuid()}.pdf`;
        } else if (reportFileFormat == 'html') {
            fileName = `${uuid()}.html`
        } else {
            logger.error('Invalid file format. Enter html/pdf');
            res.send({
                status: false,
                message: 'Invalid file format. Enter html/pdf'
            });
        }
        logger.debug('Requested report format: ', reportFileFormat);
        //Here we are passing options to puppeteer. most of the settings are self explanatory
        //read puppeteer documentation for more options
        var options = {
            width: '1230px',
            headerTemplate: "<span></span>",
            displayHeaderFooter: true,
            margin: {
                top: '20px',
                bottom: '70px',
                right: '20px',
                left: '20px'
            },
            printBackground: true,
            format: 'A4',
            footerTemplate: '<div style="margin-left:15px; margin-right:15px; border-top: 1px solid rgb(166, 166, 166); display:flex; justify-content:space-between; font-size:10px; padding-right:20px; width:100%">' +
                '<div style="padding-left:5px; padding-top:5px;">I am a Beautiful PDF</div> ' +
                '<div style="padding-top:5px;"><span class="pageNumber"></span> of <span class="totalPages"></span></div>' +
                '</div>'
        }

        try {
            //compile the html using handlebars
            const template = handlebars.compile(file);
            //map json data to template
            const html = template(jsonData);
            //lets launch a headless chromium browser to process the te,palte and generate pdf
            //headless=true makes the browser headless
            const browser = puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true
            }).then(function (browser) {
              //create a headless browser page
                browser.newPage().then(function (page) {
                  //we are disabling javascript execution on the headless browser to avoid any security vulnerabilities
                    page.setJavaScriptEnabled(false).then(function () {
                        switch (reportFileFormat) {
                            case 'pdf':
                                page.setContent(html, {waitUntil: ['domcontentloaded', 'load', "networkidle0"]})
                                    .then(function () {
                                        //use page.pdf funciton to convert the html to pdf
                                        var buffer = page.pdf(options).then(function (buffer) {
                                            browser.close().then(function () {
                                                logger.debug('succesfully generated PDF');
                                                //set the pdf and send it back as API response
                                                res
                                                    .set({
                                                        'Content-Type': 'application/pdf',
                                                        'Content-Length': buffer.length,
                                                        "Content-Disposition": "attachment; filename=" + fileName,
                                                    })
                                                    .send(buffer)
                                            });
                                        });
                                    });
                                break
                            case 'html':
                                page.setContent(template(jsonData), {waitUntil: ['domcontentloaded', 'load', "networkidle0"]})
                                    .then(function () {
                                        page.content(options).then(function (buffer) {
                                            browser.close().then(function () {
                                                    logger.debug('succesfully generated sanitized HTML');
                                                    res
                                                        .set({
                                                            'Content-Type': 'text/html',
                                                            'Content-Length': buffer.length,
                                                            "Content-Disposition": "attachment; filename=" + fileName,
                                                        })
                                                        .send(html)
                                            });
                                        });
                                    });
                                break
                            default:
                                break
                        }
                    });
                });
            });
        } catch (error) {
            logger.error("error generating Pdf", error);
            res.status(422).send(error);
        }
    } catch (error) {
        logger.error("error generating Pdf", error);
        res.status(422).send(error);
    }
};

module.exports = router;
