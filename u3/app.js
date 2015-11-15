/** Main app for server to start a small REST API for tweets
 * The included ./blackbox/store.js gives you access to a "database" which contains
 * already tweets with id 101 and 102, as well as users with id 103 and 104.
 * On each restart the db will be reset (it is only in memory).
 * Best start with GET http://localhost:3000/tweets to see the JSON for it
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";

// node module imports
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

// own modules imports
var store = require('./blackbox/store.js');


// creating the server application
var app = express();

// logger
var log4js = require('log4js');
var logger = log4js.getLogger();

// Middleware ************************************
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// logging
app.use(function(req, res, next) {
    console.log('Request of type '+req.method + ' to URL ' + req.originalUrl);
    next();
});

// API-Version control. We use HTTP Header field Accept-Version instead of URL-part /v1/
app.use(function(req, res, next){
    // expect the Accept-Version header to be NOT set or being 1.0
    var versionWanted = req.get('Accept-Version');
    if (versionWanted !== undefined && versionWanted !== '1.0') {
        // 406 Accept-* header cannot be fulfilled.
        res.status(406).send('Accept-Version cannot be fulfilled').end();
    } else {
        next(); // all OK, call next handler
    }
});

// request type application/json check
app.use(function(req, res, next) {
    if (['POST', 'PUT'].indexOf(req.method) > -1 &&
        !( /application\/json/.test(req.get('Content-Type')) )) {
        // send error code 415: unsupported media type
        res.status(415).send('wrong Content-Type');  // user has SEND the wrong type
    } else if (!req.accepts('json')) {
        // send 406 that response will be application/json and request does not support it by now as answer
        // user has REQUESTED the wrong type
        res.status(406).send('response of application/json only supported, please accept this');
    }
    else {
        next(); // let this request pass through as it is OK
    }
});


// Routes ***************************************

// tweets
app.get('/tweets', function(req,res,next) {
    res.json(store.select('tweets'));
});

app.post('/tweets', function(req,res,next) {
    var id = store.insert('tweets', req.body); // TODO check that the element is really a tweet!
    // set code 201 "created" and send the item back
    res.status(201).json(store.select('tweets', id));
});

app.get('/tweets/:id', function(req,res,next) {
    res.json(store.select('tweets', req.params.id));
});

app.delete('/tweets/:id', function(req,res,next) {
    store.remove('tweets', req.params.id);
    res.status(200).end();
});

app.put('/tweets/:id', function(req,res,next) {
    store.replace('tweets', req.params.id, req.body);
    res.status(200).end();
});

//users
app.route('/users')
    .get(function(req, res) {
        var url = req.protocol + '://' + req.get('host') + req.originalUrl;
        //logger.debug(users.length);
        res.json({
            'href': url,
            'items': store.select('users')
        });
    })
    .post(function(req, res) {
        var id = store.insert('users', req.body);
        res.status(201).json(store.select('users', id));
    })
    .put(function(req, res) {
        res.send('The request method PUT is inappropriate for the URL.');
    })
    .delete(function(req, res) {
        res.send('The request method DELETE is inappropriate for the URL.');
    });

app.route('/users/:id')
    .get(function(req, res) {

        var url = req.protocol + '://' + req.get('host') + req.originalUrl,
            tweetList = store.select('tweets'),
            tweets = [];

        for(var t in tweetList) {
            if (tweetList.hasOwnProperty(t)) {
                if(tweetList[t].creator.href == url){
                    tweets.push(tweetList[t]);
                };
            }
        }

        res.json({
            'href': url,
            'firstname': store.select('users', req.params.id).firstname,
            'lastname': store.select('users', req.params.id).lastname,
            'tweets': tweets
        });

    })
    .post(function(req, res) {
        res.send('The request method POST is inappropriate for the URL.');
    })
    .put(function(req, res) {
        store.replace('users', req.params.id, req.body);
        res.status(200).end();
    })
    .delete(function(req, res) {
        store.remove('users', req.params.id);
        res.status(200).end();
    })
    .patch(function(req, res) {
        //logger.debug("patch");
        store.replace('users', req.params.id, req.body, true);
        res.status(200).end();
    });

// CatchAll for the rest (unfound routes/resources ********

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers (express recognizes it by 4 parameters!)

// development error handler
// will print stacktrace as JSON response
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log('Internal Error: ', err.stack);
        res.status(err.status || 500);
        res.json({
            error: {
                message: err.message,
                error: err.stack
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            error: {}
        }
    });
});


// Start server ****************************
app.listen(3000, function(err) {
    if (err !== undefined) {
        console.log('Error on startup, ',err);
    }
    else {
        console.log('Listening on port 3000');
    }
});