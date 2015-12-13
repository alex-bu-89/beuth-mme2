/** This module defines the routes for videos using a mongoose model
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)

// modules
var express = require('express');
var logger = require('debug')('me2u5:videos');
var storetools = require('../restapi/store-tools');

// db conf
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/me2');

// db models
var videosModel = require('../models/videos.js');

// routes
var videos = express.Router();

// status codes
var codes = {
    success: 200,
    created: 201,
    wrongrequest: 400,
    notfound: 404,
    wrongmethod: 405,
    wrongdatatyperequest: 406,
    wrongmediasend: 415,
    nocontent: 204
};

var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {_id: 'string', timestamp: 'number', "__v": 'string', "updatedAt": 'number'};

// routes **********************
videos.route('/')
    .get(function(req, res, next) {
        videosModel.find( {}, function(err, items) {
            if (!err) {
                res.locals.items = items;
                res.locals.processed = true;
                next();
            } else {
                next(err);
            }
        });
    })
    .post(function(req,res,next) {
        // set timestamp
        req.body.timestamp = new Date().getTime();
        // insert in db
        var video = new videosModel(req.body);
        video.save(function(err) {
            if (!err) {
                res.status(201).locals.items = video;
                res.locals.processed = true;
                next();
            } else {
                err.message += ' in fields: ' + Object.getOwnPropertyNames(err.errors);
                err.status = codes.wrongrequest;
                next(err);
            }
        });
    })
    .all(function(req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });

videos.route('/:id')
    .get(function(req, res,next) {
        // TODO check req.params.id
        videosModel.findById(req.params.id, function(err, items) {
            if (!err) {
                res.locals.items = items;
                res.locals.processed = true;
                next();
            } else {
                next(err);
            }
        });
    })
    .put(function(req, res,next) {
        // check if id's are equal
        if (req.params.id === req.body._id) {

            storetools.checkKeys(req.body, requiredKeys, optionalKeys, internalKeys, videosModel);

            //logger(req.body);

            videosModel.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, item) {
                res.status(200);
                res.locals.items = item;
                res.locals.processed = true;
                next();
            });
        } else {
            var err = new Error('id of PUT resource and send JSON body are not equal ' + req.params.id + " " + req.body.id);
            err.status = codes.wrongrequest;
            next(err);
        }
    })
    .delete(function(req,res,next) {
        var id = parseInt(req.params.id);

        // TODO replace store and use mongoose/MongoDB
        // store.remove(storeKey, id);

        // ...
        //    var err = new Error('No element to delete with id ' + req.params.id);
        //    err.status = codes.notfound;
        //    next(err);
        // ...
        res.locals.processed = true;
        next();


    })
    .patch(function(req,res,next) {
        // TODO replace these lines by correct code with mongoose/mongoDB
        var err = new Error('Unimplemented method!');
        err.status = 500;
        next(err);
    })

    .all(function(req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new Error('this method is not allowed at ' + req.originalUrl);
            err.status = codes.wrongmethod;
            next(err);
        }
    });


// this middleware function can be used, if you like or remove it
// it looks for object(s) in res.locals.items and if they exist, they are send to the client as json
videos.use(function(req, res, next){
    // if anything to send has been added to res.locals.items
    logger("[res.locals.items length]: " + Object.getOwnPropertyNames(res.locals.items).length);
    if (res.locals.items && res.locals.items.length > 0) {
        // then we send it as json and remove it
        res.json(res.locals.items);
        delete res.locals.items;
    } else {
        // otherwise we set status to no-content
        res.set('Content-Type', 'application/json');
        res.status(204).end(); // no content;
    }
});

module.exports = videos;