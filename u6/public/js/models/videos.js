/**
 *  Backbone Model of a videos
 *  Backbone Collection of videos
 *  Connected to REST API /videos
 *
 *  @author Alexander Buyanov
 */
define(['backbone', 'underscore'], function(Backbone, _) {
    var result = {};

    var videoSchema = {
        urlRoot: '/videos',
        idAttribute: "_id",
        defaults: {
            description: '',
            playcount: null,
            ranking: ''
        },
        initialize: function() {

        },
        validate: function(attr) {
            if ( _.isEmpty(attr.title) ) {
                console.error("Missing title");
                return "Missing title";
            }
            if (_.isEmpty(attr.src)) {
                console.error("Missing src");
                return "Missing src";
            }
            /*if (_.isEmpty(attr['length'])) {
                console.error("Missing length");
                return "Missing length";
            }*/
            // TODO save validate length false. always an error
        }

    };

    var VideoModel = Backbone.Model.extend(videoSchema);

    var VideoCollection = Backbone.Collection.extend({
        model: VideoModel,
        url: '/videos',
        initialize: function() {
            this.on('add', function(video) {
                if (video.isValid() && video.isNew()) {
                    video.save();
                }
            })
        }
    });

    result.Model = VideoModel;
    result.Collection = VideoCollection;
    return result;
});
