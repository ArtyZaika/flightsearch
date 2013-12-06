var AirlineCodeDAO = require('./airlinecode.dao')
   ,AirportCodeDAO = require('./airportcode.dao');

function DAO(){

    this.insertCode = function(data, callback){
        throw "THis method is abstract and Must be implemented!!!";
    };

    this.findByCode = function(key, callback){
        throw "THis method is abstract and Must be implemented!!!";
    };

    this.getDAO = function(db, daoType){
        if( daoType === "airline" ){
            return new AirlineCodeDAO(db);
        }else{
            return new AirportCodeDAO(db);
        }
    }

}

module.exports = DAO;
