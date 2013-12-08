function ParserAbstract(){
}

ParserAbstract.prototype.parseCodesPageToPopulate = function(rawHtml, callback){
    throw "This method is abstract and Must be populated!!!";
};

ParserAbstract.prototype.isAlphaNum = function(s) {
    var reg = /^[A-z0-9]/g;
    var matched = reg.test(s);
    if (!matched) {
        //console.log("Not all values were parsed properly:" + s);
    }
    return matched;
}

//Remove redundant whitespace at the beginning of the string
ParserAbstract.prototype.removeWhitespaces = function(str){
    return new String(str).replace(/\s+/, '');
}

ParserAbstract.prototype.isString = function(value){
    return (typeof value == 'string' || value instanceof String);
}

module.exports = ParserAbstract;
