/** module for providing a simple interface to a kind of database (only in memory)
 *  @description
 *  primary methods exposed as public:
 *  - select (String type, Number id) [@returns undefined, one element or array of elements]
 *  - insert (String type, Object element) [@returns ID of new element]
 *  - replace (String type, Number id, Object element) [@returns this (the store object)]
 *  - remove (String type, Number id) [@returns this (the store object)]
 *
 *  All methods throw Errors if something went wrong.
 *  Elements stored in store are expected to have an .id property with a numeric value > 0 (except on insert(..))
 * @author Johannes Konert
 * @licence  CC BY-SA 4.0
 *
 * @fires Error in methods if something went wrong
 * @module blackbox/store
 * @type {Object}
 */
"use strict";

// a singleton for ID generation
var globalCounter = (function() {
    var i = 100;
    return function() {
        return ++i;
    }

})();

// our "in memory database" is a simple object!
var memory = {};

// default videos content
memory.videos = [
    {
        id: globalCounter(),
        title: "Gaming can make a better world (Jane McGongigal)",
        description: "Game Designer and Future researcher Jane McGonigal explains parts of her book about reality is Broken. She sums up how gaming and gamers can save our planet by solving the hard problems.",
        src: "http://download.ted.com/talks/JaneMcGonigal_2010-480p.mp4?apikey=489b859150fc58263f17110eeb44ed5fba4a3b22",
        length: 22*60+56,
        timestamp: 12,
        playcount: 34234,
        ranking: 234
    },
    {
        id: globalCounter(),
        title: "The next web (Tim Berners-Lee)",
        description: "20 years ago, Tim Berners-Lee invented the World Wide Web. For his next project, he's building a web for open, linked data that could do for numbers what the Web did for words, pictures, video: unlock our data and reframe the way we use it together.",
        src: "http://download.ted.com/talks/TimBernersLee_2009-480p.mp4?apikey=489b859150fc58263f17110eeb44ed5fba4a3b22",
        length: 19*60+13,
        timestamp: 432,
        playcount: 4234235,
        ranking: -324
    }
]

// private helper functions
var checkElement = function(element) {
    if (typeof(element) !== 'object') {
        throw new Error('Element is not an object to store', element);
    }
};

var store = {


    /** Selects all of one specific element from a given type list
     *
     * @param [string} type - the String identifier of the DB table
     * @param {string or number} id - (optional) ID of element to select only one
     * @returns {[],{}, undefined} - undefined if nothing found, array of objects or one object only if ID was given
     */
    select: function(type, id) {
        var list = memory[type];
        id = parseInt(id);
        if (list != undefined && list.length > 0 && !isNaN(id)) {
            list = list.filter(function(element) {
                return element.id === id;
            });
            list =  (list.length === 0)? undefined: list[0]; // only return the 1 found element; prevent empty []
        }
        return list; // may contain undefined, object or array;
    },


    /** Inserts an element into the list of type
     *
     * @param {string} type
     * @param {object} element
     * @returns {Number} the new id of the inserted element as a Number
     */
    insert: function(type, element) {
        checkElement(element);
        if (element.id !== undefined) {
            throw new Error("element already has an .id value, but should not on insert!",e);
        }
        element.id = globalCounter();
        memory[type] = memory[type] || [];
        memory[type].push(element);
        return element.id;
    },


    /** Replaces an existing element. id and newElement.id must be identical
     *
     * @param {string} type
     * @param {string} id
     * @param {object} newElement  needs to have .id property of same value as id
     * @returns {this} the store object itself for pipelining
     */
    replace: function(type, id, newElement) {
        var index = null;
        checkElement(newElement);
        var found = store.select(type, id);
        if (found === undefined) {
            throw new Error('element with id '+id+' does not exist in store type '+type, newElement);
        }
        id = parseInt(id);
        // now get the index of the element
        memory[type].forEach(function(item, i) {
            if (item.id === id) {
                index = i;
            }
        });
        // case of index = null cannot happen as it was found before, but...
        newElement.id = id; // for type safety
        if (!newElement.id == id) {
            throw new Error("element.id and given id are not identical! Cannot replace");
        }
        memory[type][index] = newElement;
        return this;
    },


    /** Removes an element of given id from the store
     *
     * @param {string} type
     * @param {Number} id numerical id of element to remove
     * @returns {this} store object itself for pipelining
     */
    remove: function(type, id) {
        var index = null;
        var found = store.select(type, id);
        if (found === undefined) {
            throw new Error('element with id '+id+' does not exist in store type '+type);
        }
        id = parseInt(id);
        // now get the index of the element
        memory[type].forEach(function(item, i) {
            if (item.id === id) {
                index = i;
            }
        });
        if (index === null) throw new Error("element to remove not found in store "+ type + " "+ id);
        memory[type].splice(index, 1);
        return this;
    }
};
module.exports = store; // let require use the store object