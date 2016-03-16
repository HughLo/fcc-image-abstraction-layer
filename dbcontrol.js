var mongo = require('mongodb').MongoClient;

//pass in the connection string
var DBControl = function(connString) {
    if(!(this instanceof DBControl)) return new DBControl(connString);
    this.connString = connString;
};

DBControl.prototype = {
    constructor: DBControl,
    
    Insert: function(term, date, callback) {
        if(typeof term !== "string" || !(date instanceof Date)) {
            callback(new Error("invalid argument type"));
            return;
        }
        
        mongo.connect(this.connString, (e, db)=>{
            if(e) {
                callback(e);
                return;
            }
            
            var c = db.collection("image-search-history");
            c.insertOne({
                "term": term,
                "when": date
            }, (e, r)=> {
               db.close();
               callback(e, r);
            });
        });
    },
    
    Find: function(callback) {
        mongo.connect(this.connString, (e, db)=> {
           if(e) {
               callback(e);
               return;
           } 
           
           var c = db.collection("image-search-history");
           c.find({}).limit(10).addQueryModifier("$orderBy", {when: -1}).
            toArray((e, docs) => {
                db.close();
                callback(e, docs);
            });
        });
    }
};

module.exports = DBControl;