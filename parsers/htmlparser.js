var AirlineCodeParser = require('./airlinecode.parser.js')
  ,AirportCodeParser = require('./airportcode.parser.js')
  ,FlightstatsParser = require('./flightstats.parser.js');

function HTMLParser(){
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