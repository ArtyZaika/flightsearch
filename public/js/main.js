/**
 * Created by Artem on 29.11.13.
 */
$(function(){


    function requestAirlines(request, response) {
        var params = { search: request.term};
        var url = '/airlines_searching';
        $.get( url, params, function(data) {
            response($.map(data, function(item) {
                return {
                    label: "(IATA:" + item.iata + " ICAO:" +item.icao+ ") " + item.name,
                    value: item.iata
                };
            }));
        });
    }

    function requestAirports(request, response) {
        var params = { search: request.term};
        var url = '/airports_searching';
        $.get( url, params, function(data) {
            response($.map(data, function(item) {
                return {
                    label: "(" + item.code + ") " + item.airport + ", " + item.city + ", " + item.country,
                    value: item.code
                };
            }));
        });
    }

    //$(document).ready(function() {
    $("#airlines_search").autocomplete({
        source: requestAirlines,
        minLength: 2,
        messages: {
            noResults: '',
            results: function() {}
        }
    });

    $("#airports_search").autocomplete({
        source: requestAirports,
        minLength: 2,
        messages: {
            noResults: '',
            results: function() {}
        }
    });

    $('button#search').click( function() {
        var airport = $('input#airports_search').val();
        var airline = $('input#airlines_search').val();


        if(!airport){
            $('div#mandatory').addClass("has-error");
            return false;
        } else {
            $('div#mandatory').removeClass("has-error");
        }


        //Show message that data is being processed
        dataProcessingMessage();
        //Clear previous search results
        $('div#content').empty();
        //set header
        $('div#content').append(strHeader);

        if(airport && airline){
            processAirportAndAirlineData();
        } else {
            processAirportData();
        }
        return false;
    });


    function processAirportAndAirlineData() {
        var prDate = new Date();
        var range = prDate.getHours() <= 12 ? ["-1", "0"] : ["-1", "12"];

        range.forEach(function(queryTime, index){
            postAjaxWithDelay(prepareAirportAndAirlinePostObject(queryTime));
        });

    }

    function processAirportData(){
        var timeSlots = {0:"0", 1:"0", 2:"0", 3:"0", 4:"0", 5:"0", 6:"6", 7:"6", 8:"6", 9:"9", 10:"9", 11:"9", 12:"12",
            13:"12", 14:"12", 15:"15", 16:"15", 17:"15", 18:"18", 19:"18", 20:"18", 21:"21", 22:"21", 23:"21"};

        var dateNow = new Date();
        var currentHour = dateNow.getHours();
        var ranges = ["-1"];
        //These once have previous or next values to show
        if(timeSlots[currentHour] > 6 || timeSlots[currentHour] < 20){
            ranges[ranges.length] = timeSlots[currentHour];
            ranges[ranges.length] = timeSlots[currentHour];
        } else {
            ranges["-1"] = "-1";  //TODO: INVESTIGATE LOGIC!!!!
        }


        ranges.forEach(function(queryTime, index){
            postAjaxWithDelay(prepareAirportPostObject(queryTime, index));
        });
    }

    function prepareAirportPostObject(queryTime, index) {
        var data = prepareBasePostObject();
        data["airportQueryTime"] = queryTime;
        if(queryTime < 3 ){
            data["queryNext"] = true;
            data["queryPrevious"] = false;
        } else if(queryTime > 20){
            data["queryNext"] = false;
            data["queryPrevious"] = true;
        } else if(queryTime == "-1" && index > 0){
            data["sameRequest"] = true;
        } else {
            data["queryNext"] = !data["queryNext"];
            data["queryPrevious"] = !data["queryNext"];
        }
        return data;
    }

    function prepareAirportAndAirlinePostObject(queryTime) {
        var data = prepareBasePostObject();
        data["airportQueryTime"] = queryTime;
        data["queryNext"] = (el == "0");
        data["queryPrevious"] = !data["queryNext"];
        return data;
    }




    function prepareBasePostObject(){
        var airportQueryType = "";
        var selected = $("input[type='radio'][name='radioGroup']:checked");
        if (selected.length > 0) {
            airportQueryType = selected.val();
        }

        var data = {
            airport: $('input#airports_search').val(),
            airportQueryType: airportQueryType,
            airlineToFilter: $('input#airlines_search').val()
        };
        return data;
    }

    function postAjaxWithDelay(data){
        window.timer = setTimeout(function() { // setting the delay 2sec
            $.ajax({
                url: '/flightstats_search',
                type: 'post',//,
                async: false, //TODO: ASSYNC!!!
                dataType: 'json',
                data: data,
                success: function (data) {
                    if (data.result && data.result.length > 0) {
                        dataProcessingDoneMessage();
                        buildSearchResults(data.result);
                    } else {
                        dataNothingFoundMessage();
                    }
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }, 2000);
    }

    function buildSearchResults(flghtstats) {
        flghtstats.forEach(function (elem, index) {
            $('div#search_result').append(parametriseHTMLWithParam(strSearchResults, elem));
        });
    }

    function parametriseHTMLWithParam (html, params) {
        var replacements = {"%DESTINATION%": params.destination, "%FLIGHT%": params.flight, "%AIRLINE%": params.airline,
            "%SCHEDULE%":params.schedule, "%ACTUAL%":params.actual, "%GATE%":params.gate, "%STATUS%":params.status, "%DATE%": params.date};

        var str = html.replace(/%\w+%/g, function (all) {
            return replacements[all] || all;
        });
        return str;
    }

    function prepareDataToSubmitForm(){
        //prepare today date to be send
        //$('form#search_form>input#flightStatusByAirport_airportQueryDate').val(presentDate());


        /*input(name="airport", type="hidden", value="(KBP) Kiev/Kyiv - Borispol Airport", id="flightStatusByAirport_airport")
        input(name="airportQueryTime", type="hidden", value="12", id="flightStatusByAirport_airportQueryTime")
        input(name="airportQueryType", type="hidden", value="0", id="flightStatusByAirport_airportQueryType")
        input(name="queryNext", type="hidden", value="false", id="flightStatusByAirport_queryNext")
        input(name="queryPrevious", type="hidden", value="false", id="flightStatusByAirport_queryPrevious")
        input(name="sortField", type="hidden", value="3", id="flightStatusByAirport_sortField")*/
    }



    function dataProcessingMessage(){
        $('#alert_process').show();
        $('#alert_done').hide();
        $('#alert_nothing').hide();
    }

    function dataProcessingDoneMessage(){
        $('#alert_done').show();
        $('#alert_process').hide();
        $('#alert_nothing').hide();
    }

    function dataNothingFoundMessage(){
        $('#alert_nothing').show();
        $('#alert_process').hide();
        $('#alert_done').hide();
    }



    var strSearchResults = "<div class='row'>\
                    <div class='col-lg-1'>\
                        <h5>%DATE%</h5>\
                    </div>\
                    <div class='col-lg-2'>\
                        <h5>%DESTINATION%</h5>\
                    </div>\
                    <div class='col-lg-1'>\
                        <h5>%FLIGHT%</h5>\
                    </div>\
                    <div class='col-lg-1'>\
                        <h5>%AIRLINE%</h5>\
                    </div>\
                    <div class='col-lg-2'>\
                        <h5>%SCHEDULE%</h5>\
                    </div>\
                    <div class='col-lg-2'>\
                        <h5>%ACTUAL%</h5>\
                    </div>\
                    <div class='col-lg-1'>\
                        <h5>%GATE%</h5>\
                    </div>\
                    <div class='col-lg-2'>\
                        <h5>%STATUS%</h5>\
                    </div>\
                </div>";

    var strHeader = "<div class='row'>\
        <div id='search_result' class='panel panel-default'>\
            <div class='panel-heading'>\
                <div class='row'>\
                    <div class='col-lg-1'></div>\
                    <div class='col-lg-2'></div>\
                    <div class='col-lg-1'></div>\
                    <div class='col-lg-1'></div>\
                    <div class='col-lg-1'></div>\
                    <div class='col-lg-3'>\
                        <h4>Departure</h4>\
                    </div>\
                    <div class='col-lg-1'>\
                        <h4>Term</h4>\
                    </div>\
                    <div class='col-lg-2'></div>\
                </div>\
                <div class='row'>\
                    <div class='col-lg-1'>\
                         <h4>Date</h4>\
                    </div>\
                    <div class='col-lg-2'>\
                        <h4>Destination</h4>\
                    </div>\
                    <div class='col-lg-1'>\
                        <h4>Flight</h4>\
                    </div>\
                    <div class='col-lg-1'>\
                        <h4>Airline</h4>\
                    </div>\
                    <div class='col-lg-2'>\
                        <h4>Sched</h4>\
                    </div>\
                    <div class='col-lg-2'>\
                        <h4>Actual</h4>\
                    </div>\
                    <div class='col-lg-1'>\
                        <h4>Gate</h4>\
                    </div>\
                    <div class='col-lg-2'>\
                        <h4>Status</h4>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>";


    var FunctionQueue = (function(){
        var queue = [];
        var add = function(fnc){
            queue.push(fnc);
        };
        var goNext = function(){
            var fnc = queue.shift();
            try {
                fnc();
            } catch (err){
                console.log(err.message);
            }

        };
        return {
            add:add,
            goNext:goNext
        };
    }());

    //});​

//    $.ajax({
//        url: '/flightstats_search',
//        type: 'post',
//        dataType: 'json',
//        data: $('form#search_form').serialize(),
//        success: function (data) {
//            if (data.result) {
//                dataProcessingDoneMessage();
//                buildSearchResults(data.result);
//            } else {
//                dataNothingFoundMessage();
//            }
//        }
//    });

    /*function makeRequest(request, response) {
        $.ajax({
            url: 'http://query.yahooapis.com/v1/public/yql',
            data: {
                q: buildQuery(request.term),
                format: "json"
            },
            dataType: "jsonp",
            success: function(data) {
                var airports = [];
                console.log('DATA:' + data.query.results.json.json);
                if (data && data.query && data.query.results && data.query.results.json && data.query.results.json.json) {
                    airports = data.query.results.json.json;
                }

                response($.map(airports, function(item) {
                    return {
                        label: item.code + (item.name ? ", " + item.location : "") + ", " + item.location,
                        value: item.code
                    };
                }));
            },
            error: function () {
                response([]);
            }
        });
    }
     $('#iata_searchss').on('keyup', function(e){
     console.log('aaaa');
     if(e.keyCode === 13) {
     console.log('bbbbbb');
     var params = { search: $(this).val() };
     var url = '/iata_searching';
     $.get( url, params, function(data) {
     $('#results').html(data);
     });
     };
     });

     function buildQuery(term) {
     console.log(term + " length:" + term.length + " encode.length:" + encodeURI(term).length);
     //return "select * from json where url = 'https://api.flightstats.com/flex/airports/rest/v1" + encodeURI(term) + "'";
     return "select * from json where url = 'http://airportcode.riobard.com/search?fmt=JSON&q=" + encodeURI(term) + "'";
     //return "'http://airportcode.riobard.com/search?fmt=JSON&q=" + encodeURI(term) + "'";
     }

    */



});
