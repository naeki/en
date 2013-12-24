// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require underscore
//= require backbone

//= require ./posts/posts

window.App = {
    name        : "en_js",
    version     : "0.0",
    Views       : {},
    Models      : {},
    Collections : {}
};


App.Router = Backbone.Router.extend({
    initialize : function(){
        Backbone.history.start({pushState: true});
    },
    routes: {
        "all"    : "_all",
        "digest" : "_digest"
    },
    _all     : function(path){
        this._use("all")
    },
    _digest  : function(path){this._use("digest")},
    _use : function(path){
        switch (path){
            case "all":
                alert("all");
                break
            case "digest":
                alert("digest");
                break
        }
    }
});


(function(){
    App.router = new App.Router();
    App.main = new App.Views.Main();
})();


$(document).on("ready", function(){
    App.main = new App.Views.Main();
    $("#digest").click(function(){
        App.router.navigate("/digest", {trigger: true, replace: false});
    });
});





App.Views.Main = Backbone.View.extend({
    _markup : "<div class='use-main'>\
            <div class='sidebar'></div>\
            <div class='workspace'>Hello</div>\
            <div class='optionsbar'></div>\
        </div>",
    initialize : function(){
        this.render();
    },
    render : function(){
        $("body").html(this._markup);
    }
});