var HTMLParser = require('./htmlparser')
    ,cheerio = require('cheerio')
    ,fs = require('fs')
    ,DateTimeUtils = require('./datetime');

function FlightstatsParser(){
    /*
     * Формат
     Destination (код) | Flight (с код-шерами - разобраться что это) | Airline | Departure Schedule/Actual | Gate | Status

     Если код авиакомпании задан, то все рейсы на сегодня по этой АК (+/- 12 часов - сутки в центром на текущий период времени)
     Формат
     Date | Destination (код) | Flight (с код-шерами - разобраться что это) | Departure Schedule/Actual | Gate | Status
     *
     * */
    var dateTimeUtils = new DateTimeUtils();

  this.parseCodesPageToPopulate = function(rawHtml, callback){
        //var rawHtml = fs.readFileSync('./test_data/test_full.html', 'utf8');

        var schedules = [];
        var skippedTags = {b:"b",  tr: "tr", table: "table", tbody: "tbody"};

        var $ = cheerio.load(rawHtml);



        $("table.tableListingTable>tr").each(function(index, trElem) {
            //Ignore all table headers
            if($(trElem).hasClass('tableHeader')) return;

            var tdChildren = trElem.children;
            var parsedVals = [];

            tdChildren.forEach(function(el, index){
                if(el.type != "tag" || !shouldBeParsed(el)) return;

                var value = parseComplexCell(el);
                parsedVals.push(value);

            });

            if(parsedVals.length > 0){

                schedules.push({
                    date: dateTimeUtils.presentDate(),
                    destination: parsedVals[0],
                    flight: parsedVals[1],
                    airline: parsedVals[2],
                    schedule: parsedVals[3],
                    actual: parsedVals[4],
                    gate: parsedVals[5],
                    status: parsedVals[6]
                });
            }
        });

      /*
       * Skips all <tr> with <th> elements, that don't have actual data
       * */
      function shouldBeParsed(tdValue) {
          var tdData = parseComplexCell(tdValue);
          if (isString(tdData)) {
              if(tdValue.name == "td"){
                  if(tdData.length == 0){
                      return ((typeof tdValue.attribs.nowrap != 'undefined') && tdValue.attribs.nowrap.length >= 0);
                  }
                  return tdData;
              }
              return (tdValue.attribs.nowrap && tdValue.name == "td" );
          }
          return false;
      }

      function parseComplexCell(element) {
          var children = element.children;
          if (!element.children)
              return;

          if (children.length > 1) {
              var tempName = "";

              children.forEach(function (el, index) {
                  tempName += parseCodeshares(el);
              });
              return tempName;
          }
          //For common case: "<td class='border1'><a href='../united_states.htm'>USA</a></td>"
          return parseCodeshares(element);
      }

      function parseCodeshares(child) {
          var tempString = '';
          if (child) {
              if (child.type == "tag" && child.name == "span") {
                  tempString += "<span class='" + child.attribs.class + "'>";
                  tempString += (child.children) ? child.children[0].data : "&nbsp;";
                  tempString += "</span>";
              } else if (child.type == "tag" && child.name == "br") {
                  tempString += "<br/>";
              } else {
                  tempString += (child.children) ? parseCodeshares(child.children[0]) : parseChildForString(child);
              }
          }
          return tempString;
      }

      function parseChildForString(child) {
          if (child && !(child.name in skippedTags)) {
              var tempVal = child.data;
              if (isString(tempVal)) {
                  return tempVal;
              } else {
                  try {
                      tempVal = child.children[0].data;
                      if(!isString(tempVal)){
                          //continue to parse until find all text info of children nodes
                          return parseComplexCell(child.children[0]);
                      }
                      return tempVal;
                  } catch(err){
                      console.log(err);
                      return '';
                  }
              }
          }
          return "";
      }

      function isString(value){
          return (typeof value == 'string' || value instanceof String);
      }
      //console.log(schedules);
      callback(schedules);
    };

};

module.exports = FlightstatsParser;
