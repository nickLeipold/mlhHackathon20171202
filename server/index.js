var express = require('express')
var URL = require('url');

var app = express();

// In memory db for fast speed
var db = [];

app.use(express.json());

// Should be the first middleware
app.use(function(req, res, next) {
//    log({
//        message: 'in url middleware'
//    });
    req.urlPath = URL.parse(req.originalUrl).path;

    next();
});

// API
app.post("/api/newgame", function(req, res, next) {

    if (req.body !== undefined) {
        log({
            message: 'API request received',
            body: JSON.stringify(req.body)
        });
        log(req.body);
    } else {
        log({
            message: 'Body does not contain JSON'
        });
    }

    res.send('hello world\n');

    next();
});


// Should be the last middleware
app.use(function(req, res, next) {
    log({
        method: req.method,
        path: req.urlPath,
        srcIP: req.connection.remoteAddress,
        statusCode: res.statusCode
    });
    next();
});

app.listen(8080, function() {
    log({
        message: 'startup, port 8080'
    });
});

process.on('exit', function() {
    log({
        message: 'shutdown'
    });
});

process.on('SIGINT', process.exit);

function log(obj) {
    logStr = ""
    logStr += '[' + new Date().toISOString() + ']';

    fieldsArray = [];
    Object.keys(obj).forEach(function(key) {
        fieldsArray.push(key + '=' + obj[key]);
    });

    console.log(logStr + fieldsArray.join(','));
}

function logBasic(logStr) {
    console.log(logStr);
}
