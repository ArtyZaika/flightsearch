var http = require('http')
    , HTMLParser = require('./../parsers/htmlparser')
    , request = require('request');


function DataPopulator(){
    var htmlParser = new HTMLParser();

    this.populateCodes = function (options, callback) {
        var that = this;

        //For each letter in URL, get result in raw HTML and parse it to array
        options.pages.forEach(function (element, index) {
            var url = that.parametrisedUrlWithParam(options.url, element);

            that.makeRequest(url, options.postObj, function (rawHTML) {
                var parser = htmlParser.getParser(options.parser);
                parser.parseCodesPageToPopulate(rawHTML, function (parsedArray) {

                    if (options.dao) {
                        options.dao.insertCode(parsedArray, function (err, result) {
                            if (err) callback(err);
                        });
                    }
                    callback(parsedArray);
                });
            });
        });
    };

    this.makeRequest = function (url, postObj, callback) {
        if (postObj) {
            request({
                url: url,
                method: "POST",
                form: postObj
            }, function (err, resp, body) {
                // pass back the results to client side
                callback(body);
            });
        } else {
            request({
                url: url,
                method: "GET"
            }, function (err, resp, body) {
                // pass back the results to client side
                callback(body);
            });
        }
    };

    /*
     * Expects URL in format: "http://www.airlinecodes.info/name/%PAGE%" or
     * http://www.nationsonline.org/oneworld/IATA_Codes/IATA_Code_%PAGE%.htm
     * replaces placeholder with param value.
     *
     * */
    this.parametrisedUrlWithParam = function (url, param) {
        var replacements = {"%PAGE%": param};

        var str = url.replace(/%\w+%/g, function (all) {
            return replacements[all] || all;
        });
        return str;
    }

}

module.exports = DataPopulator;
