/** This module defines the routes for videos using the store.js as db memory
 *
 * @author Alexander Buyanov
 * @author Steffen Glöde
 * @licence CC BY-SA 4.0
 *
 * @module filter ()
 * @type {Router}
 */

var router = require('express').Router();
var logger = require('debug')('me2u4:videos/filter');

var allowedAttributs = ["title", "src", "length", "description", "playcount", "ranking", "id", "timestamp"];

/**
 *
 * @param attributs
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

// task 2a
router.use(function(req, res, next){
    var filter;
    if(req.query.filter){
        filter = req.query.filter.split(',');
        if(!checkAttributs(filter)){
            err = new Error('attribute(s) not allowed');
            err.status = 400; // bad request
            next(err);
        } else {
            res.locals.filter = filter;
        }
    }
    next();
});

module.exports = router;