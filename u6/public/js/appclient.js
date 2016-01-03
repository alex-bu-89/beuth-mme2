/** Main application file to start the client side single page app for videos
 *
 * @author Alexander Buyanov
 */

requirejs.config({
    baseUrl: "/js",
    paths: {
        jquery: './_lib/jquery-1.11.3',
        underscore: './_lib/underscore-1.8.3',
        backbone: './_lib/backbone-1.2.3',
    },
    shim: {
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});

// AMD conform require as provided by require.js
require(['jquery','backbone', 'models/videos', 'views/video-list'], function($, Backbone, Videos, VideosViewList) {

    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'main',
            '*whatever': 'main'
        },
        main: function(){
            var videos = new Videos.Collection();
            var videosViewList = new VideosViewList({collection: videos});
            videos.fetch();
        }
    });

    var myRouter = new AppRouter();

    // finally start tracking URLs to make it a SinglePageApp (not really needed at the moment)
    Backbone.history.start({pushState: true}); // use new fancy URL Route mapping without #
});
