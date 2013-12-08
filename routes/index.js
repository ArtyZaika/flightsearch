var DataPopulator = require('./../utils/data.populator.js')
    , DAO = require('../dbdao/dao')
    , request = require('request')
    , DateTimeUtils = require('../utils/datetime');

module.exports = exports = function(app, db) {
    var daoDB = new DAO();
    var dateTimeUtils = new DateTimeUtils();
    var dataPopulator = new DataPopulator();

    app.get('/', function(req, res){
        res.render('index', { title: 'Flights on FlightStats.com' });
    });

    app.get('/airlines_searching', function(req, res){
        // input value from search
        var val = req.query.search;
        var dao = daoDB.getDAO(db, "airline");

        dao.findByCode(val, function(err, results){
            res.send(results);
        });
    });

    app.get('/airports_searching', function(req, res){
        // input value from search
        var val = req.query.search;
        var dao = daoDB.getDAO(db, "airport");

        dao.findByCode(val, function(err, results){
            res.send(results);
        });
    });

    app.get('/insert_airlinecodes', function(req, res){
        var pages = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        var dao = daoDB.getDAO(db, "airline");

        dataPopulator.populateCodes({
            dao: dao,
            pages: pages,
            parser: "airline",
            url: "http://www.airlinecodes.info/name/%PAGE%"}, function(result){
            res.send('populator', { flghtstats: result});
        });
    });

    app.get('/insert_airportcodes', function(req, res){
        var pages = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        var dao = daoDB.getDAO(db, "airport");

        dataPopulator.populateCodes({
            dao: dao,
            pages: pages,
            parser: "airport",
            url: "http://www.nationsonline.org/oneworld/IATA_Codes/IATA_Code_%PAGE%.htm"}, function(result){
            res.send('populator', { result: result});
        });
    });

    app.post('/flightstats_search', function(req, res){

        var airport = req.body.airport;
        var airlineToFilter = req.body.airlineToFilter;

        if(airport && airlineToFilter){
            requestAirlineStats(req, function(result){
                res.send('index', { result: result});
            });
        } else {
            requestAirportStats(req, function(result){
                res.send('index', { result: result});
            });
        }
    });

    function requestAirlineStats(req, callback) {
        var postObj = prepareFlightStatsPostObject(req);
        dataPopulator.populateCodes({
            pages: ["A"],
            parser: "flightstats",
            url: "http://www.flightstats.com/go/FlightStatus/flightStatusByAirport.do",
            postObj: postObj}, callback);
    }

    function requestAirportStats(req, callback){
        var postObj = prepareFlightStatsPostObject(req);
        postObj["airlineToFilter"] = "-- All Airlines --";
        dataPopulator.populateCodes({
            pages: ["A"],
            parser: "flightstats",
            url: "http://www.flightstats.com/go/FlightStatus/flightStatusByAirport.do",
            postObj: postObj}, callback);
    }

    function prepareFlightStatsPostObject(req){
       var postObj = {
            airportQueryDate: dateTimeUtils.presentDate(),
            airport: req.body.airport,
            airportQueryTime: req.body.airportQueryTime,
            airportQueryType: req.body.airportQueryType,
            airlineToFilter: req.body.airlineToFilter
        };

        if(req.body.airportQueryTime != "-1" || req.body.sameRequest){
            postObj.queryNext = req.body.queryNext;
            postObj.queryPrevious = req.body.queryPrevious;
            postObj.airportToFilter = "-- All Airports --";
            postObj.sortField = "3";
            postObj.codeshareDisplay = "0";
        }
        return postObj;
    }


}