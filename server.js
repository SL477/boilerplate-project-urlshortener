'use strict';

var express = require('express');
// var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

//Need dotenv for testing in windows
require('dotenv').config();

/** this project needs a db !! **/
//  mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true}, function (err) {
//    if (err) {
//      console.log(err);
//    } else {
//      console.log("Connected");
//    }
//  });
mongoose
    .connect(process.env.MONGOLAB_URI)
    .then(console.log('Connected'))
    .catch((ex) => console.error(ex));

//  var db = mongoose.connection;

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
    res.json({ greeting: 'hello API' });
});

//dns lookup
var dns = require('dns');

//schema
//var Schema = mongoose.Schema;
var UrlRecordSchema = new mongoose.Schema({
    urlstr: { type: String, required: true },
});
var URLRecord = mongoose.model('URLRecord', UrlRecordSchema);

//Post URLS
app.post('/api/shorturl/new', function (req, res) {
    console.log(req.body.url);

    //check the url
    //need to take off the http(s):// part so that the dns lookup will work
    if (req.body.url.indexOf('://') == -1) {
        res.json({ error: 'invalid URL' });
    } else {
        var smallUrl = req.body.url.substring(req.body.url.indexOf('://') + 3);
        console.log(smallUrl);
        dns.lookup(smallUrl, function (err) {
            if (err) {
                res.json({ error: 'invalid URL' });
            } else {
                //Log to MongoDB
                //var ul = new URLRecord({urlstr: req.body.url});
                // URLRecord.create({urlstr: req.body.url}, function (err, data) {
                //   if (err) {
                //     console.log(err);
                //   } else {
                //     res.json({"original_url": req.body.url, "short_url": data._id});
                //   }
                // });
                URLRecord.create({ urlstr: req.body.url })
                    .then((data) =>
                        res.json({
                            original_url: req.body.url,
                            short_url: data._id,
                        })
                    )
                    .catch((err) => console.error(err));
            }
        });
    }
});

//Browse to the short url
app.get('/api/shorturl/:id', function (req, res) {
    //Lookup the id
    // URLRecord.findById(req.params.id).exec(function (err, u1) {
    //     if (err) {
    //         console.log(err)
    //         res.json({ error: 'Wrong Format' })
    //     } else {
    //         //res.redirect(u1);
    //         console.log('redirecturl')
    //         console.log(u1.urlstr)
    //         res.writeHead(301, { Location: u1.urlstr })
    //         //res.writeHead(301, {Location: "https://google.com"});
    //         res.end()
    //     }
    // })
    URLRecord.findById(req.params.id)
        .then((d) => {
            console.log('redirect url', d, d.urlstr);
            res.writeHead(301, { location: d.urlstr });
            res.end();
        })
        .catch((ex) => {
            console.error(ex);
            res.json({ error: 'Wrong Format' });
        });
});

app.listen(port, function () {
    console.log('Node.js listening ...');
});
