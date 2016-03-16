var fs = require('fs');

var Util = function() {
    if(!(this instanceof Util)) return new Util();

    var data = fs.readFileSync("./config");
    this.ConfigObject = JSON.parse(data.toString("utf8"));
};

Util.prototype = {
    constructor: Util,
    MakeDBOption: function() {
        if(process.env.MONGOLAB_URI) {
            return {
                connString: process.env.MONGOLAB_URI
            };
        } else {
            return {
                host: "localhost",
                port: 20202,
                dbName: "image-search"
            };
        }
    }  
};

module.exports = Util;
