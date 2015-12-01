/** This module defines the routes for videos using the store.js as db memory
 *  by 'get' request we can use [?filter=text,text...], [?offset=num], [?limit=num] in url to edit json
 *
 * @author Johannes Konert
 * @author Alexander Buyanov
 * @author Steffen Glöde
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */

// modules
var express = require('express');
var logger = require('debug')('me2u4:videos');
var store = require('../blackbox/store');
var filter = require('../restapi/filter.js');

var videos = express.Router();

//videos.use(filter);

// if you like, you can use this for task 1.b:
var requiredKeys = {title: 'string', src: 'string', length: 'number'};
var optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};

var allowedAttributs = ["title", "src", "length", "description", "playcount", "ranking", "id", "timestamp"];


// routes **********************
videos.route('/')
    .get(function(req, res, next) {

        var videos = store.select('videos'),
            result = []; // result obj. is sent to res.locals.items obj. at the end of 'get'

        // FILTER *****************
        if(req.query.filter){

            var filter = req.query.filter.split(','), // split 'query.filter' string and set it in an array
                filteredVideos = [];

            // error if attributs not allowed. See [allowedAttributs] array
            if(!checkAttributs(filter)){
                err = new Error('attribute(s) not allowed');
                err.status = 400; // bad request
                next(err);
            }

            // do filter and set the result
            videos.forEach(function(video) {
                var temp = {};
                filter.forEach(function(attr) {
                    temp[attr] = video[attr];
                });
                filteredVideos.push(temp);
            });
            result = filteredVideos;
        } else {

            // send all videos if we don't have filter
            result = videos;
        }

        // OFFSET *****************
        if(req.query.offset){

            // check if offset is a number, greater than 0 and smaller than video's length
            if(isNaN(req.query.offset) || req.query.offset < 0 || req.query.offset >= parseInt(result.length)){
                err = new Error('offset has wrong value');
                err.status = 400; // bad request
                next(err);
            }

            // do offset filter
            result = result.filter(function(element, index) { return index >= Math.round(req.query.offset) });
        }

        // LIMIT *****************
        if(req.query.limit){

            // check if limit is a number and greater than 1
            if(req.query.limit < 1 || isNaN(req.query.limit) ){
                err = new Error('limit has wrong value');
                err.status = 400; // bad request
                next(err);
            }

            // do offset limit
            result = result.filter(function(element, index) { return index < Math.round(req.query.limit) });
        }

        // set result in locals.items
        res.locals.items = result;
        next();

    })
    .post(function(req,res,next) {
        if(JSON.stringify(req.body) !== '{}'){ // check if req.body not empty

            // check required values
            if( req.body.title == undefined ||
                req.body.src == undefined ||
                req.body.length == undefined
            ){
                err = new Error('required fields missing');
                err.status = 400; // bad request
                next(err);
            }

            // set default values
            if(req.body.description == undefined){ req.body.description = "Some description" }
            if(req.body.playcount == undefined){ req.body.playcount = 0 }
            if(req.body.ranking == undefined){ req.body.ranking = 0 }
            if(req.body.timestamp == undefined){ req.body.timestamp = new Date().getTime() }

            // insert
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
            result = {}; // result obj

        // FILTER *****************
        if(req.query.filter){
            var filter = req.query.filter.split(','),
                filteredVideos = {};

            // error if attributs not allowed. See [allowedAttributs] array
            if(!checkAttributs(filter)){
                err = new Error('attribute(s) not allowed');
                err.status = 400; // bad request
                next(err);
            }

            // do filter
            filter.forEach(function(attr) {
                filteredVideos[attr] = video[attr];
            });

            // set result
            result = filteredVideos;
        } else {
            result = videos;
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
            store.replace('videos', req.params.id, req.body); // replace video obj. by id
            res.locals.items = store.select('videos', req.params.id); // send this obj back
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
            // remove
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

/**
 * checks if attributes exist in 'allowedAttributs' array
 * sends false if one of attributes not allowed, true if all attributes allowed
 * @param attributes
 * @returns {boolean}
 */
function checkAttributs( attributs ) {
    // check if attribut is allowed
    for(var i=0; i < attributs.length; i++){
        if(allowedAttributs.indexOf(attributs[i]) == -1){
            return false;
        }
    }
    return true;
}

module.exports = videos;
