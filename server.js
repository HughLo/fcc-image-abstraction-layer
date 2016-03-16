var express = require('express');
var Util = require('./util.js');
var https = require('https');
var queryString = require('querystring');
//var fs = require('fs');

var app = express();
var util = Util();

//return image search results
app.get("/api/imagesearch/:qs", function(req, res) {
  var qobj = {
    key: util.ConfigObject.key,
    cx: util.ConfigObject.cseid,
    q: req.params.qs || "",
    searchType: "image",
    fields: "items(link,snippet, image/contextLink, image/thumbnailLink)",
    start: req.query.offset || 1, //index shall be start from 1
  };
  
  getSearchResult(qobj, (e, d) => {
      res.writeHead(200, {"Content-Type": "application/json"});
      if(e) {
          console.log("error happend");
          res.end(JSON.stringify({
              error: e.toString()
          }));
          return;
      }
      
      //CSE may return error object such as "start" is 0.
      if(d.hasOwnProperty("error")) {
        res.end(JSON.stringify(d));
      } else {
        var result = [];
        for(var i = 0; i < d.items.length; ++i) {
          result.push({
            url: d.items[i].link,
            snippet: d.items[i].snippet,
            thumbnail: d.items[i].image.thumbnailLink,
            context: d.items[i].image.contextLink
          });
        }
        res.end(JSON.stringify(result));
      }
  });
});

//return lastest image search
app.get("/api/latest/imagesearch", function(res, req) {

});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("server listening on port: " + port);
});

//request google custom search and return the results.
var getSearchResult = function(qobj, callback) {
  var qstr = queryString.stringify(qobj);
  
  console.log(qstr);

  var buf = [];
  var size = 0;
  https.get("https://www.googleapis.com/customsearch/v1?" + qstr,
    (getRes) => {
      getRes.on("data", (chunk) => {
      buf.push(chunk);
      size += chunk.length;
    }).on("end", () =>{
        var totalBuf = Buffer.concat(buf, size);
        //console.log(totalBuf.toString());
        //fs.writeFile("./results.json", totalBuf.toString());
        callback(null, JSON.parse(totalBuf.toString()));
    });
  }).on("error", (e) => {
    callback(e);
  });
};
