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
        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        initialize: function() {
            // this.collection is a Backbone Collection
            this.listenTo(this.collection,'add', this.render);
        }
    });
    return VideosView;
});