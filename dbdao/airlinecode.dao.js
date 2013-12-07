var DAO = require('./dao');

function AirlineCodeDAO(db){

    var airlnCd = db.collection("airlncd");

    this.insertCode = function(data, callback){
        airlnCd.insert(data, {safe:true}, function (err, result) {
            if (err) {
                console.log(err);
                console.log("ERROR Data: " + result[0].iata + " " + result[0].icao + " " + result[0].name);
                callback({error: "ERROR while Inserted new Airline Code"});

            } else {
                console.log("Inserted new Airline Code: " + result[0].iata + " " + result[0].icao + " " + result[0].name);
                callback({success: "Inserted new Airline Code:"});
            }
        });
    };

    this.findByCode = function (key, callback) {
        var reqExpVal = new RegExp("^" + key.toUpperCase());

        airlnCd.find({$or: [{icao:{$regex: reqExpVal, $options: 'i'}},
            {iata:{$regex: reqExpVal, $options: 'i'}},
            {name:{$regex: reqExpVal, $options: 'i'}}]}).toArray(function (err, items) {
            if (err) {
                callback(err);
            }
            callback(err, items);
        });
    }

};

module.exports = AirlineCodeDAO;
