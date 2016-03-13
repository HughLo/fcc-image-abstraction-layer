var fs = require('fs');

var Util = function() {
    if(!(this instanceof Util)) return new Util();
};

Util.prototype.configObject = function(callback) {
    fs.readFile("./config", function(err, data) {
        if(err) {
            callback(err);
            return;
        }
        
        
    });
};

module.exports = Util;