/**
 *  Backbone View for the list of tweets. Delegator View without any own template. Uses VideoView.
 *  Needs collection to be set from outside.
 *
 *  @author Johannes Konert
 *  @author Alexander Buyanov
 */
define(['backbone', 'jquery', 'underscore', 'views/videos'], function(Backbone, $, _, VideosView) {
    var VideosListView = Backbone.View.extend({
        el: '#content',
        template: undefined,
        render: function() {
            this.$el.empty();
            this.collection.each(function(video) {
                var videosView = new VideosView({model: video});
                this.$el.prepend(videosView.render().el);
            }, this);
            return this;
        },
        initialize: function() {
            // this.collection is a Backbone Collection
            this.listenTo(this.collection,'add', this.render);
        }
    });
    return VideosListView;
});