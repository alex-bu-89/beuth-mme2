/** This module represents as video schema for mongoose/MongoBD
 * required params: [title, src, length]
 * [length, playcount, ranking] should be positive numbers
 *
 * @author Alexander Buyanov
 * @author Steffen Glöde
 * @licence CC BY-SA 4.0
 *
 * @module models/videos
 * @type {Object}
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var videosSchema = new Schema({
    title: { type: String, required: true},
    description: { type: String, default: '' },
    src: { type: String, required: true},
    length: { type: Number, required: true, min: 0},
    playcount: { type: Number, default: 0, min: 0 },
    ranking: { type: Number, default: 0, min: 0 }
}, {
    timestamps: {createdAt: 'timestamp'}
});

module.exports = mongoose.model('Videos', videosSchema);