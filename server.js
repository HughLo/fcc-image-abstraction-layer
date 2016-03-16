var express = require('express');
var Util = require('./util.js');
var https = require('https');
var queryString = require('querystring');
var DBControl = require('./dbcontrol.js');
//var fs = require('fs');

var connString = process.env.MONGOLAB_URI || "mongodb://localhost:20202/image-search";
var app = express();
var util = Util();
var dbc = DBControl(connString);

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
  
  dbc.Insert(qobj.q, new Date(), (e, r) => {
    if(e) {
      console.log("insert record in DB error: " + e.toString());
      return;
    }
  });
  
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
app.get("/api/latest/imagesearch", function(req, res) {
  dbc.Find((e, docs) => {
    if(e) {
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("cannot get search history");
      return;
    }
    
    var result = [];
    for(var i = 0; i < docs.length; ++i) {
      result.push({
        term: docs[i].term,
        when: docs[i].when
      });
    }
    
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(result));
  });
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
