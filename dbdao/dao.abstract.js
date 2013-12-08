function DAOAbstract(){
}
DAOAbstract.prototype.insertCode = function(data, callback){
    throw "THis method is abstract and Must be implemented!!!";
};

DAOAbstract.prototype.findByCode = function(key, callback){
    throw "THis method is abstract and Must be implemented!!!";
};

module.exports = DAOAbstract;

