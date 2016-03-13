var fs = require('fs');

var Util = function() {
    if(!(this instanceof Util)) return new Util();

    var data = fs.readFileSync("./config");
    this.ConfigObject = JSON.parse(data.toString("utf8"));
};

module.exports = Util;
