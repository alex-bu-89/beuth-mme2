/** This module defines the routes for videos using the store.js as db memory
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
var logger = require('debug')('me2u4:videos');
var store = require('../blackbox/store');
var filter = require('../restapi/filter.js');

var videos = express.Router();

videos.use(filter);

// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};

// routes **********************
videos.route('/')
    .get(function(req, res, next) {

        var videos = store.select('videos'),
            result = [];

        if(res.locals.filter){
            var filter = res.locals.filter,
                filteredVideos = [];
            videos.forEach(function(video) {
                var temp = {};
                filter.forEach(function(attr) {
                    temp[attr] = video[attr];
                });
                filteredVideos.push(temp);
            });
            result = filteredVideos;
        } else {
            result = videos;
        }
        if(req.query.limit){
            if(req.query.limit < 1 || isNaN(req.query.limit) ){
                err = new Error('limit has wrong value');
                err.status = 400; // bad request
                next(err);
            }
            res.locals.limit = Math.round(req.query.limit);
        }
        if(req.query.offset){
            logger(req.query.offset > parseInt(result.length + 1));

            if(isNaN(req.query.offset) || req.query.offset < 0 || req.query.offset >= parseInt(result.length)){
                err = new Error('offset has wrong value');
                err.status = 400; // bad request
                next(err);
            }
            res.locals.offset = Math.round(req.query.offset);
        }

        // OFFSET
        if(res.locals.offset){
            result = result.filter(function(element, index) { return index >= res.locals.offset });
        }

        // LIMIT
        if(res.locals.limit){
            result = result.filter(function(element, index) { return index < res.locals.limit });
        }

        res.locals.items = result;

        next();
    })
    .post(function(req,res,next) {
        if(JSON.stringify(req.body) !== '{}'){ // check if req.body not empty

            // check required value
            if( req.body.title == undefined ||
                req.body.src == undefined ||
                req.body.length == undefined
            ){
                err = new Error('required fields missing');
                err.status = 400; // bad request
                next(err);
            }

            // set default value
            if(req.body.description == undefined){ req.body.description = "Some description" }
            if(req.body.playcount == undefined){ req.body.playcount = 0 }
            if(req.body.ranking == undefined){ req.body.ranking = 0 }
            if(req.body.timestamp == undefined){ req.body.timestamp = new Date().getTime() }

            var id = store.insert('videos', req.body);
            res.status(201).locals.items = store.select('videos', id);
        }
        next();
    })
    .put(function(req,res,next) {
        var err = new Error('Method PUT without ID not allowed.');
        err.status = 405;
        next(err);
    });

videos.route('/:id')
    .get(function(req, res, next) {

        var video = store.select('videos', req.params.id),
            result = {};

        if(res.locals.filter){

            var filter = res.locals.filter,
                filteredVideos = {};

            filter.forEach(function(attr) {
                filteredVideos[attr] = video[attr];
            });
            result = filteredVideos;
        } else {
            result = video;
        }

        res.locals.items = result;
        next();
    })
    .post(function(req,res,next) {
        var err = new Error('Method POST with ID not allowed.');
        err.status = 405;
        next(err);
    })
    .put(function(req,res,next) {
        if(req.body.id == req.params.id){
            store.replace('videos', req.params.id, req.body);
            res.locals.items = store.select('videos', req.params.id);
            next();
        } else {
            err = new Error('cannot replace element of id '+req.params.id+' with given element.id '+req.body.id);
            err.status = 400; // bad request
            next(err);
        }
    })
    .delete(function(req,res,next) {
        // check if id exists
        if(store.select('videos', req.params.id) != undefined){
            store.remove('videos', req.params.id);
            res.status(200);
            next();
        } else {
            err = new Error('couldn\'t delete video with id: ' + req.params.id + '. id doesn\'t exist');
            err.status = 404; // not found
            next(err);
        }
    });

// this middleware function can be used, if you like or remove it
videos.use(function(req, res, next){
    // if anything to send has been added to res.locals.items
    if (res.locals.items) {
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
