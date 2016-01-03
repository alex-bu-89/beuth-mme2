/** This module defines some functions to check objects for proper required and optional fields.
 *
 * @author Johannes Konert
 * @author Alexander Buyanov
 * @author Steffen Glöde
 * @licence CC BY-SA 4.0
 *
 * @module restapi/store-tools
 * @type {Object}
 */

"use strict";

var logger = require('debug')('me2:store-tool');

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

/**
 * This function expects up to three given objects describing key: valueFormat pairs, e.g.
 * req = {id: 'number', firstname: 'string', lastname: 'string'}
 *
 * The functions checks the given item to exist and to have the required keys of proper type,
 * the optional keys can be missing , but if present need correct type,
 * none params are checked to be not present.
 *
 * In all cases type 'number' is checked to be > 0
 *
 * @param item
 * @param req required keys are checked for their type
 * @param opt keys are checked for type. added if not present
 * @param none keys that should not be there
 * @param model of a collection
 * @return {undefined}
 * @throws Error if requirements not fullfilled.
 */
exports.checkKeys = function checkKeys(item, model, isPatch) {

    //logger(model.model.paths[options]);

    function throwErr(message, code) {
        var err = new Error(message);
        err.status = code;
        throw err;
    }

    if (!item) { throwErr("proper body missing", codes.wrongrequest); }

    // objs
    var req = {},
        opt = {},
        none = {_id: 'string', timestamp: 'number', "updatedAt": 'number'};

    if(!isPatch){
        // create req, opt, none objects
        model.schema.eachPath(function(path) {
            if( model.schema.paths[path].isRequired ){
                req[path] = model.schema.paths[path].instance.toString().toLowerCase();
            } else {
                opt[path] = model.schema.paths[path].instance.toString().toLowerCase();
            }
        });

        // remove none values from opt obj
        Object.getOwnPropertyNames(opt).filter(function(e) {
            if(Object.keys(none).indexOf(e) != -1){
                delete opt[e];
            }
        });
    }

    logger(req);
    logger(opt);

    // check required fields to be correct
    var reqMissing = Object.getOwnPropertyNames(req).filter(function(elem, index, array) {
        var mistake =  !item.hasOwnProperty(elem) || typeof(item[elem]) !== req[elem];
        // make sure numbers are > 0;
        if (!mistake && req[elem] === 'number') {
            mistake = item[elem] < 0;
        }
        return mistake;
    });
    if (reqMissing.length > 0) {
        throwErr("required fields are missing or of wrong type or value < 0: " + reqMissing.toString(), codes.wrongrequest);
    }
    // check optional fields to be correct, if present
    var optWrong = Object.getOwnPropertyNames(opt).filter(function(elem, index, array) {
        var mistake =  item.hasOwnProperty(elem) && typeof(item[elem]) !== opt[elem];
        // directly add missing values
        if (!item.hasOwnProperty(elem)) {
            switch(opt[elem]) {
                case 'number':
                    item[elem] = 0;
                    break;
                case 'string':
                    item[elem] = '';
                    break;
            }
        }
        // make sure numbers are >= 0;
        if (!mistake && opt[elem] === 'number') {
            mistake = item[elem] < 0;
        }
        return mistake;
    });

    if (optWrong.length > 0) {
        throwErr("optional fields are of wrong type or value < 0: " + optWrong.toString(), codes.wrongrequest);
    }

    // delete internal fields from body.message.
    Object.getOwnPropertyNames(none).filter(function(elem, index, array) {
        delete item[elem];
    });

    // check if attribute in body.message doesn't define in model
    var wrongValues = Object.getOwnPropertyNames(item).filter(function(elem, index, array) {
        if(Object.keys(model.schema.paths).indexOf(elem) == -1){
            return true;
        }
    });

    // show error
    if(wrongValues.length > 0){
        throwErr("Wrong value in body: " + wrongValues.toString(), codes.wrongrequest);
    }
}