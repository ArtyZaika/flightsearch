
/**
 * Module dependencies.
 */

var express = require('express')
   ,routes = require('./routes')
   ,http = require('http')
   ,path = require('path')
   ,MongoClient = require('mongodb').MongoClient;


var app = express();

MongoClient.connect('mongodb://localhost:27017/flight_search', function(err, db) {
    if(err) throw err;

    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    routes(app, db);

    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });

});


