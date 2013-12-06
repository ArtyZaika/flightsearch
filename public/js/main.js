/**
 * Created by Artem on 29.11.13.
 */
$(function () {


    function requestAirlines(request, response) {
        var params = { search: request.term};
        var url = '/airlines_searching';
        $.get(url, params, function (data) {
            response($.map(data, function (item) {
                return {
                    label: "(IATA:" + item.iata + " ICAO:" + item.icao + ") " + item.name,
                    value: item.iata
                };
            }));
        });
    }

    function requestAirports(request, response) {
        var params = { search: request.term};
        var url = '/airports_searching';
        $.get(url, params, function (data) {
            response($.map(data, function (item) {
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
            results: function () {
            }
        }
    });

    $("#airports_search").autocomplete({
        source: requestAirports,
        minLength: 2,
        messages: {
            noResults: '',
            results: function () {
            }
        }
    });

    $('button#search').click(function () {
        var airport = $('input#airports_search').val();
        var airline = $('input#airlines_search').val();


        if (!airport) {
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

        if (airport && airline) {
            processAirportAndAirlineData();
        } else {
            processAirportData();
        }
        return false;
    });


    function processAirportAndAirlineData() {
        var prDate = new Date();
        var range = prDate.getHours() <= 12 ? ["-1", "0"] : ["-1", "12"];

        range.forEach(function (queryTime, index) {
            postAjaxWithDelay(prepareAirportAndAirlinePostObject(queryTime));
        });

    }

    function processAirportData() {
        var timeSlots = {0: "0", 1: "0", 2: "0", 3: "0", 4: "0", 5: "0", 6: "6", 7: "6", 8: "6", 9: "6", 10: "6", 11: "6", 12: "12",
            13: "12", 14: "12", 15: "12", 16: "12", 17: "12", 18: "18", 19: "18", 20: "18", 21: "18", 22: "18", 23: "18"};

        var dateNow = new Date();
        var currentHour = dateNow.getHours();
        var ranges = ["-1"];
        //These once have previous or next values to show
        if (timeSlots[currentHour] > 6 || timeSlots[currentHour] < 20) {
            ranges[ranges.length] = timeSlots[currentHour];
            ranges[ranges.length] = timeSlots[currentHour];
        } else {
            ranges["-1"] = "-1";
        }

        ranges.forEach(function (queryTime, index) {
            postAjaxWithDelay(prepareAirportPostObject(queryTime, index));
        });
    }

    function prepareAirportPostObject(queryTime, index) {
        var data = prepareBasePostObject();
        data["airportQueryTime"] = queryTime;
        if(queryTime == -1 || (queryTime > 6 && queryTime < 20)){
            data["queryNext"] = index == 1 ? false : true;
            data["queryPrevious"] = index == 1 ? true : false;
        } else if (queryTime < 6) {
            data["queryNext"] = true;
            data["queryPrevious"] = false;
        } else if (queryTime > 20) {
            data["queryNext"] = false;
            data["queryPrevious"] = true;
        } else if (queryTime == "-1" && index > 0) {
            data["sameRequest"] = true;
        }
        return data;
    }

    function prepareAirportAndAirlinePostObject(queryTime) {
        var data = prepareBasePostObject();
        data["airportQueryTime"] = queryTime;
        data["queryNext"] = (queryTime == "0");
        data["queryPrevious"] = !data["queryNext"];
        return data;
    }


    function prepareBasePostObject() {
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

    function postAjaxWithDelay(data) {
        window.timer = setTimeout(function () { // setting the delay 2sec
            $.ajax({
                url: '/flightstats_search',
                type: 'post',//,
                async: false,
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

    function parametriseHTMLWithParam(html, params) {
        var replacements = {"%DESTINATION%": params.destination, "%FLIGHT%": params.flight, "%AIRLINE%": params.airline,
            "%SCHEDULE%": params.schedule, "%ACTUAL%": params.actual, "%GATE%": params.gate, "%STATUS%": params.status, "%DATE%": params.date};

        var str = html.replace(/%\w+%/g, function (all) {
            return replacements[all] || all;
        });
        return str;
    }

    function dataProcessingMessage() {
        $('#alert_process').show();
        $('#alert_done').hide();
        $('#alert_nothing').hide();
    }

    function dataProcessingDoneMessage() {
        $('#alert_done').show();
        $('#alert_process').hide();
        $('#alert_nothing').hide();
    }

    function dataNothingFoundMessage() {
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

});
