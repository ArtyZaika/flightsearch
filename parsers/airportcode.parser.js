var cheerio = require('cheerio')
    ,sys = require('sys')
    ,AbstractParser = require('./parser.abstract');

function AirportCodeParser(){

    var that = this;

    this.parseCodesPageToPopulate = function(rawHtml, callback){
        var airportCodes = [];
        var skippedTags = {b:"b", br:"br", tr: "tr", table: "table", tbody: "tbody"};
        var $ = cheerio.load(rawHtml);

        $("table[summary^='IATA']>tr").each(function(index, trElem) {
            var tdChildren = trElem.children;
            var parsedVals = [];

            tdChildren.forEach(function(el, index){
                if(el.type != "tag" || !shouldBeParsed(el)) return;

                var value = parseComplexCell(el);
                parsedVals.push(value);

            });

            if(parsedVals.length > 0){
                if(parsedVals.length != 4) {
                    return;
                }

                airportCodes.push({
                    code: parsedVals[0],
                    city: parsedVals[1],
                    airport: parsedVals[2],
                    country: parsedVals[3]
                });
            }


        });

        /*
        * Skips all <tr> with <th> elements, that don't have actual data
        * */
        function shouldBeParsed(tdValue) {
            var tdData = parseSimpleCell(tdValue);
            if (typeof tdData == 'string' || tdData instanceof String) {
                return (tdData.length > 0 && tdValue.name == "td" && that.isAlphaNum(tdData));
            }
            return false;
        }

        function parseSimpleCell (element) {
            if (element.children && element.children.length > 0) {
                return parseChildForString(element.children[0]);
            }
            return  "";
        }

        function parseComplexCell(element){
            var children = element.children;
            //For these cases: "<td class='border1'><a href='../united_states.htm'>USA</a>, MI</td>" or
            //"<td class='border1'>Canary Islands, <a href='../spain.htm'>Spain</a></td>"
            if(children.length > 1){
                var tempName = "";
                children.forEach(function(el, index){
                    tempName += parseChildForString(el);
                });
                return tempName;
            }
            //For common case: "<td class='border1'><a href='../united_states.htm'>USA</a></td>"
            return parseChildForString(element.children[0]);
        }

        function parseChildForString(child) {
            if (child && !(child.name in skippedTags)) {
                var tempVal = child.data;
                if (typeof tempVal == 'string' || tempVal instanceof String) {
                    return that.removeWhitespaces(tempVal);
                } else {
                    try {
                       return that.removeWhitespaces(child.children[0].data);
                    } catch(err){
                        console.log(err);
                        return 'EMPTY';
                    }
                }
            }
            return "";
        }

        callback(airportCodes);
    };

};

sys.inherits(AirportCodeParser, AbstractParser);

module.exports = AirportCodeParser;
