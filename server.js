'use strict';

var express = require('express');
//var mongoClient = require('mongodb').MongoClient;
//var mongoose = require('mongoose');
const mongoose = require('mongoose');
require('dotenv').config();

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
 mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true});
 console.log(mongoose.connection.readyState);
 console.log(process.env.MONGOLAB_URI);
 //const client = new mongoClient(process.env.MONGOLAB_URI, { useNewUrlParser: true});
 //client.connect();

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//dns lookup
var dns = require('dns');

//schema
//var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var UrlRecordSchema = new mongoose.Schema({
  urlstr: { type: String, required: true }
});
var URLRecord = mongoose.model('URLRecord', UrlRecordSchema);

//post urls
app.post("/api/shorturl/new", function (req, res) {
  console.log(req.body.url);

  //check the url
  //need to take off the http(s):// part so that the dns lookup will work
  if (req.body.url.indexOf("://") == -1){
    res.json({"error": "invalid URL"});
  } else {
    var smallUrl =  req.body.url.substring(req.body.url.indexOf("://") + 3);
    console.log(smallUrl);
    dns.lookup(smallUrl, function (err, address, family) {
      if (err) {
        res.json({"error": "invalid URL"});
        console.log(address);
      } else {
        //Log to MongoDB
       /* var u1 = new URLRecord({urlstr: req.body.url});
        u1.save(function (err, data) {
          if (err){
            console.log(err);
          } else {
            //return the submitted url
            res.json({"original_url": req.body.url, "short_url": data});
          }
        });*/
        /*var u1 = new URLRecord({urlstr: req.body.url});
        u1.save(function (err) {
          console.log("Save was called");
          if (err){
            console.log(err);
          //} else {
            //console.log(data);
            //res.json({"original_url": req.body.url});
          }
        });*/
        console.log("before save");
        
        URLRecord.create({urlstr: req.body.url}, function (err, data) {
          console.log("create called");
          if (err) {
            console.log(err);
          } else {
            console.log(data);
          }
        });
        res.json({"original_url": req.body.url});
      }
    });
  }
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});