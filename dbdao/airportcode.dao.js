var DAO = require('./dao');

function AirportCodeDAO(db){
    var airports = db.collection("airports");

    this.insertCode = function(data, callback){
        airports.insert(data, {safe:true}, function (err, result) {
            if (err) {
                console.log(err);
                console.log("Error Data: " + result[0].code + " " + result[0].airport + " " + result[0].country);
                callback({error: "ERROR while Inserted new Airport Code"});

            } else {
                //console.log("Inserted new Airport Code: " + result[0].code + " " + result[0].airport + " " + result[0].country);
                callback({success: "Inserted new Airport Code:"});
            }
        });
    };

    this.findByCode = function (key, callback) {
        var reqExpVal = new RegExp("^" + key.toUpperCase());

        airports.find({code:{$regex: reqExpVal, $options: 'i'}}).toArray(function (err, items) {
            if (err) {
                callback(err);
            }
            callback(err, items);
        });
    }




};

module.exports = AirportCodeDAO;
