'use strict';

import express from 'express';
import { connect, Schema, model } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import pkg from 'body-parser';
const { urlencoded } = pkg;
// dns lookup
import { lookup } from 'dns';

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Need dotenv for testing in windows
config();

/** this project needs a db !! **/
connect(process.env.MONGOLAB_URI)
    .then(console.log('Connected'))
    .catch((ex) => console.error(ex));

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(urlencoded({ extended: false }));
app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
    res.json({ greeting: 'hello API' });
});

// schema
const UrlRecordSchema = new Schema({
    urlstr: { type: String, required: true },
});
const URLRecord = model('URLRecord', UrlRecordSchema);

// Post URLS
app.post('/api/shorturl/new', function (req, res) {
    console.log(req.body.url);
    // check the url
    // need to take off the http(s):// part so that the dns lookup will work
    if (req.body.url.indexOf('://') == -1) {
        res.json({ error: 'invalid URL' });
    } else {
        var smallUrl = req.body.url.substring(req.body.url.indexOf('://') + 3);
        console.log(smallUrl);
        lookup(smallUrl, function (err) {
            if (err) {
                res.json({ error: 'invalid URL' });
            } else {
                // Log to MongoDB
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

// Browse to the short url
app.get('/api/shorturl/:id', function (req, res) {
    // Lookup the id
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
