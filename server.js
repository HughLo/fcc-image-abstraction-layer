var express = require('express');
var Util = require('./util.js');

var app = express();
var util = Util();

//return image search results
app.get("/api/imagesearch/:qs", function(res, req) {

});

//return lastest image search
app.get("/api/latest/imagesearch", function(res, req) {

});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("server listening on port: " + port);
});
