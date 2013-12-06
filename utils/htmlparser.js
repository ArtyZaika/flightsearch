var AirlineCodeParser = require('./airlinecode.parser')
  ,AirportCodeParser = require('./airportcode.parser')
  ,FlightstatsParser = require('./flightstats.parser')  ;

function HTMLParser(){

    this.parseCodesPageToPopulate = function(rawHtml, callback){
        throw "This method is abstract and Must be populated!!!";
    };

    this.getParser = function (paserType) {

        switch (paserType) {
            case "airline":
                return new AirlineCodeParser();
            case "airport":
                return new AirportCodeParser();
            case "flightstats":
                return new FlightstatsParser();
            default:
                throw "Type of Parser in not determined";
        }
    };
}

module.exports = HTMLParser;