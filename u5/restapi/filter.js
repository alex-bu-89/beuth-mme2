/**
 * @author Alexander Buyanov
 * @licence  CC BY-SA 4.0
 *
 * @module restapi/filter
 * @type {Object}
 */
"use strict";
var logger = require('debug')('me2:filter');

/**
 * The functions checks
 *
 * @param body
 * @param item
 * @return {object}
 * @throws Error if requirements not fullfilled.
 */

exports.filter = function filter(filter, schema){

    if( filter == undefined ){ return false }
    var filter = filter.split(',');

    var toFilter = {};

    filter.filter(function(elem, index, array) {

        // skip wrong filter value
        if(Object.keys(schema.schema.paths).indexOf(elem) == -1){
            return false;
        }
        // add to result array
        toFilter[elem] = '1';
        return true;
    });
    return toFilter || {};
};