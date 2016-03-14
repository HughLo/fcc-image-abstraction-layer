var express = require('express');
var Util = require('./util.js');
var http = require('http');
var queryString = require('querystring');
var fs = require('fs');

var app = express();
var util = Util();

//return image search results
app.get("/api/imagesearch/:qs", function(req, res) {
  var qobj = {
    key: util.ConfigObject.key,
    cx: util.ConfigObject.cseid,
    q: req.params.qs,
    searchType: "image",
    fields: "items(title,characteristics/length)"
  };

  var qstr = queryString.stringify(qobj);

  console.log("query string: ${qstr}");

  var buf = [];
  var size = 0;
  http.get("http://www.googleapis.com/customsearch/v1?" + qstr,
    (getRes) => {
      getRes.on("data", (chunk) => {
      buf.push(chunk);
      size += chunk.length;
    }).on("end", () =>{
      var totalBuf = Buffer.concat(buf, size);
      res.end(totalBuf.toString());
      fs.writeFile("./result.json", totalBuf.toString());
    });
  }).on("error", (e) => {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.strigify({
      "error": e.toString()
    }))
  });
});

//return lastest image search
app.get("/api/latest/imagesearch", function(res, req) {

});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("server listening on port: " + port);
});
