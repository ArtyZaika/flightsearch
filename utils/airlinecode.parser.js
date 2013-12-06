var HTMLParser = require('./htmlparser')
    ,cheerio = require('cheerio')
    ,util = require('util');

function AirlineCodeParser(){

    /*
    * Parses raw HTML page in format:
    *
     var $ = cheerio.load("<table class='tdata'>" +
     "<tr><th class='tdata_tc'>IATA</th><th class='tdata_tc'>ICAO</th><th>NAME</th></tr>"+
     "<tr><td>CIU</td><td>A2</td><td><a href='/airline-code-a2'>Cielos Airlines</a></td></tr>"+
     "<tr><td>AJA</td><td></td><td><a href='/airline-code-aja'>A J Services</a></td></tr>" +
     "<tr><td></td><td>1B</td><td><a href='/airline-code-aja'>Abacus International</a></td></tr>" +
     "</table>");
    *
    * */
    this.parseCodesPageToPopulate = function(rawHtml, callback){
        var airlineCodes = [];
        var that = this;
        var $ = cheerio.load(rawHtml);

        var allTRElements = $("table.tdata").children();

        for(var idx = 0; idx<allTRElements.length; idx++){
            var trEl = allTRElements[idx];
            var tdChildren = $(trEl).children();

            //<tr><td>CIU</td><td>A2</td><td><a href='/airline-code-a2'>Cielos Airlines</a></td>
            //skip all <tr> with <th> elements
            if(tdChildren[0].name == "td") {
                var name = $(tdChildren[2].children[0])[0].children[0].data,
                    iata = that.getChildData(tdChildren[1]),
                    icao = that.getChildData(tdChildren[0]);

                airlineCodes.push({
                    icao: icao,
                    iata: iata,
                    name: name
                });
            }
        }
        //console.log(airlineCodes);
        callback(airlineCodes);
    };

    this.hasChildren = function(element){
        return element.children && element.children.length > 0;
    };

    this.getChildData = function (element) {
        if (element.children && element.children.length > 0) {
            return element.children[0].data;
        }
        return  "";
    };

};

module.exports = AirlineCodeParser;
