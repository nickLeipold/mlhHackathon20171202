var express = require('express')
var URL = require('url');

var Validator = require('jsonschema').Validator;
var postNewGameSchema = require('./schema/postNewGame');
var postGameSessionSchema = require('./schema/postGameSession');
var v = new Validator();

var app = express();

// In memory db for fast speed
var db = {};

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
app.get("/api/newgame", function(req, res, next) {
    var sessionKey = newSessionKey();
    res.send(sessionKey);

    db[sessionKey] = {
        gameState: 'lobby',
        currentPlayer: 'w',
        board: newBoard(),
    };

    next();
});

app.post("/api/newgame", function(req, res, next) {

    responseJSON = {
        status: 'failed',
        yourPlayer: 'white',
        board: encodeBoard(newBoard())
    };

    if (req.body !== undefined) {
        if (v.validate(req.body, postNewGameSchema)) {
            log({
                message: 'API request received',
                body: JSON.stringify(req.body)
            });

            log({
                message: 'Adding session: ' + req.body.sessionKey
            });

            if (req.body.sessionKey in db) {
                responseJSON.board = encodeBoard(db[req.body.sessionKey]);
                responseJSON.status = 'found';

                log({
                    message: 'Session found'
                });
            } else {
                responseJSON.board = encodeBoard(newBoard());
                responseJSON.status = 'not found';

                log({
                    message: 'Session not found',
                    session: req.body.sessionKey
                });
            }
        } else {
            log({
                message: 'Body failed validation',
                body: JSON.stringify(req.body)
            });
        }
    } else {
        log({
            message: 'Body does not contain JSON'
        });
    }



    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(responseJSON));

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

function newSessionKey() {
    var characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var sessionKey = '';

    for (var i = 0; i < 5; ++i) {
        sessionKey += characterSet[Math.floor(Math.random() * characterSet.length)];
    }

    return sessionKey;
}

function newBoard() {
    var boardJSON = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    return boardJSON;
}

function encodeBoard(board) {
    var boardArray = [];
    for (var i = 0; i < board.length; ++i) {
        var ch = boardArray[i];

        if (['r', 'n', 'b', 'q', 'k', 'p'].prototype.includes(ch.toLowerCase())) {
            boardArray.push(ch);
        } else if (!isNan(ch)) {
            for (var j = 0; j < parseInt(ch); ++i) {
                boardArray.push(' ');
            }
        } else {
        }
    }
    return boardArray;
}
