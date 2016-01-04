/**
 *  Backbone View for the list of tweets. Delegator View without any own template.
 *  Needs collection to be set from outside.
 *
 *  @author Johannes Konert
 *  @author Alexander Buyanov
 */
define(['backbone', 'jquery', 'underscore'], function(Backbone, $, _) {
    var VideosView = Backbone.View.extend({
        tagName: 'div',
        className: 'video-box',
        template: _.template($('#video-template').text()),
        events: {
            'click .playPause': 'playPouseVideo',
            'click .stop': 'stopVideo',
            'click .mute': 'muteVideo',
            'change .volume-bar': 'changeVolume',
            'click .playPause.play-icon': 'incPlayCount',
        },
        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        renderPlaycount: function(model, value, options) {
            this.$el.find('.playcount').html("playcount: " + value);
        },
        initialize: function() {
            // this.collection is a Backbone Collection
            this.listenTo(this.collection,'add', this.render);
            this.listenTo(this.model,'change:playcount', this.renderPlaycount);
        },
        incPlayCount: function(){
            var model = this.model;
            var playcount = parseInt(model.get("playcount"));
            // TODO check playcount
            playcount++;
            model.set("playcount", playcount);
            model.save(model.changed, {patch: true});
        },
        playPouseVideo: function(){
            var button = this.$el.find(".playPause");
            var player = this.$el.find("video").get(0);
            if (player.paused == true) {
                // Play the video
                button.removeClass('play-icon');
                button.addClass('pause-icon');
                player.play();
            } else {
                // Pause the video
                button.removeClass('pause-icon');
                button.addClass('play-icon');
                player.pause();
            }
        },
        stopVideo: function(){
            var button = this.$el.find(".playPause");
            var player = this.$el.find("video").get(0);
            player.pause();
            player.currentTime = 0;
            button.removeClass('pause-icon');
            button.addClass('play-icon');
        },
        muteVideo: function(){
            var player = this.$el.find("video").get(0);
            var button = this.$el.find(".mute");
            if (player.muted == false) {
                player.muted = true;
                button.removeClass('muteOff-icon');
                button.addClass('muteOn-icon');
            } else {
                player.muted = false;
                button.removeClass('muteOn-icon');
                button.addClass('muteOff-icon');
            }
        },
        changeVolume: function(){
            var player = this.$el.find("video").get(0);
            var button = this.$el.find(".volume-bar");
            player.volume = button.val();
        }

    });

    return VideosView;

});