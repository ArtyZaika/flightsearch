var AirlineCodeDAO = require('./airlinecode.dao')
   ,AirportCodeDAO = require('./airportcode.dao');

function DAO(){

    this.getDAO = function(db, daoType){
        if( daoType === "airline" ){
            return new AirlineCodeDAO(db);
        }else{
            return new AirportCodeDAO(db);
        }
    }
}

module.exports = DAO;
