var childprocess = require('child_process');
var express = require('express')
var URL = require('url');

var Validator = require('jsonschema').Validator;
var postNewGameSchema = require('./schema/postNewGame');
var postGameSessionSchema = require('./schema/postGameSession');
var v = new Validator();

var app = express();

// In memory db for fast speed
var db = {
    asdf: {
        gameState: 'lobby',
        currentPlayer: 'b',
        board: 'rnbqkbnr/pppppppp/rnbqkbnr/8/8/RNBQKBNR/PPPPPPPP/RNBQKBNR'
    }
};

app.use(express.json());

// Should be the first middleware
app.use(function(req, res, next) {
    req.urlPath = URL.parse(req.originalUrl).path;

    next();
});

// API
app.get("/api/newgame", function(req, res, next) {
    var sessionKey = newSessionKey();

    db[sessionKey] = {
        gameState: 'lobby',
        currentPlayer: 'w',
        board: newBoard(),
    };

    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.json({
        sessionKey: sessionKey,
        board: encodeBoard(db[sessionKey].board)
    });


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
                responseJSON.board = encodeBoard(db[req.body.sessionKey].board);
                responseJSON.status = 'found';

                log({
                    message: 'Session found'
                });
                res.status(200);
            } else {
                responseJSON.board = encodeBoard(newBoard());
                responseJSON.status = 'not found';

                log({
                    message: 'Session not found',
                    session: req.body.sessionKey
                });
                res.status(404);
            }
        } else {
            log({
                message: 'Body failed validation',
                body: JSON.stringify(req.body)
            });
            res.status(403);
        }
    } else {
        log({
            message: 'Body does not contain JSON'
        });
        res.status(403);
    }

    res.setHeader('Content-Type', 'application/json');
    res.json(responseJSON);

    next();
});

app.get('/api/game/*', function(req, res, next) {
    var responseJSON = {
        status: 'failed',
        gameState: '',
        board: [],
        currentPlayer: ''
    };

    if (req.urlPath.split('/').length === 4) {
        var sessionKey = req.urlPath.split('/')[3];
        if (sessionKey in db) {
            var session = db[sessionKey];
            responseJSON.status = 'success';
            responseJSON.gameState = session.gameState;
            responseJSON.board = encodeBoard(session.board);
            responseJSON.currentPlayer = session.currentPlayer;
            res.status(200);
        } else {
            responseJSON.status = 'Could not find session';
            res.status(404);
        }
    } else {
        responseJSON.status = 'Invalid game URL';
        res.status(403);
    }

    res.setHeader('Content-Type', 'application/json');
    res.json(responseJSON);

    next();
});

app.post('/api/game/*', function(req, res, next) {
    var responseJSON = {
        status: 'failed',
        board: encodeBoard(newBoard())
    };

    if (req.body !== undefined) {
        if (v.validate(req.body, postNewGameSchema)) {
            if (req.urlPath.split('/').length === 4) {
                var sessionKey = req.urlPath.split('/')[3];
                if (sessionKey in db) {
                    var session = db[sessionKey];
                    if (req.body.myPlayer === session.currentPlayer) {
                        var boardStr = session.board + ' ' + session.currentPlayer;
                        log({
                            message: boardStr,
                            move: req.body.move
                        });

                        var stdoutText = '';
                        try {
                            var stdoutText = childprocess.execFileSync('/bin/bash', [
                                '-c',
                                'echo',
                                '/home/webaccess/mlhHackathon20121202/game.py',
                                boardStr,
                                req.body.move
                            ]);
                            responseJSON.status = 'success';
                            responseJSON.board = encodeBoard(stdoutText);
                        } catch (e) {
                            if (e.status == 3) {
                                // game over
                                responseJSON.status = 'gameover';
                                responseJSON.board = encodeBoard(stdoutText);
                            } else {
                                // Illegal move
                                responseJSON.status = 'illegal';
                                responseJSON.board = encodeBoard(session.board);
                            }
                        }

                    } else {
                        responseJSON.status = 'Player cannot make moves out of turn';
                        res.status(403);
                    }
                } else {
                    responseJSON.status = 'Could not find session';
                    res.status(404);
                }
            } else {
                responseJSON.status = 'Invalid game URL';
                res.status(403);
            }
        } else {
            log({
                message: 'Body failed validation',
                body: JSON.stringify(req.body)
            });
            res.status(403);
        }
    } else {
        log({
            message: 'Body does not contain JSON'
        });
        res.status(403);
    }

    res.setHeader('Content-Type', 'application/json');
    res.json(responseJSON);

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
        var ch = board[i];

        if (['r', 'n', 'b', 'q', 'k', 'p'].includes(ch.toLowerCase())) {
            boardArray.push(ch);
        } else if (!isNaN(ch)) {
            for (var j = 0; j < parseInt(ch); ++j) {
                boardArray.push(' ');
            }
        } else {
        }
    }
    return boardArray;
}
