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

window.Lang = {
    all    : "all",
    digest : "digest",
    feed   : "feed"
}




App.Router = Backbone.Router.extend({
    initialize : function(){
        Backbone.history.start({pushState: true});
    },
    routes: {
        "all"     : "_all",
        "digest"  : "_digest",
        "feed"    : "_feed",
        ":id"     : "_post",
        "user:id" : "_user",
        "new"     : "_post"
    },
    _post    : function(id){this._use({post : id})},
    _user    : function(id){this._use({user : id})},

    _all     : function(){this._use({dvsn : App.Views.All})},
    _digest  : function(){this._use({dvsn : App.Views.Digest})},
    _feed    : function(){this._use({dvsn : App.Views.Feed})},

    _use : function(options){
        App.main.open(options);
    }
});




App.loader = {
    sync : function(url, options){
        var options = options || {};
        return $.ajax({
            url  : url,
            type : options.type || "GET",
            data : {data : options.data || {}}
        }).fail(
            function(result){
                alert("error loading " + result.toString());
            }
        );
    }
}




App.Views.Main = Backbone.View.extend({
    className : "main",
    _markup : "<aside class='sidebar'>Sidebar</aside>\
               <div class='context'>Hello</div>",
    initialize : function(){
        this.render();
        this.$context = this.$el.children(".context");
        this.sidebar = new App.Views.Sidebar({
            el : this.$(".sidebar")
        });
    },
    render : function(){
        this.$el.html(this._markup);
        $("body").html(this.$el);
    },
    open : function(options){
        var view = "empty", data = {};

        if (options.post) view = this.openPost(options);
        //if (options.user) view = this.openUser(options);
        if (options.dvsn) view = this.openDivision(options);

        view = view.$el;

        this.$context[0].innerHTML = "";
        this.$context.append(view);
        //if (!options.id) this.context = view;// Из контекста ищут пост, который пытаются открыть, а из остальных режимов не смотрим, в общем нужна карта общая всех постов
    },
    openPost : function(options){
        var modelData = options.post === "new" ? {} : {id : options.post},
            model = Post.builder(modelData);

        model.isNew() || model.fetch();
        return App.Views.Post_Form.getView(model);
    },
    openDivision : function(options){
        var view = options.dvsn.view || new options.dvsn;
        view.collection.fetch();
        return view;
    },
    _setTitle : function(text){
        document.title = text;
    }
});


App.Views.Sidebar = Backbone.View.extend({
    _markup : "<ul class='sidebar-menu'></ul><span class='new-post'>New post</span>",
    events : {
        "click .new-post" : function(){
            App.router.navigate("new", {trigger:true, replace:false});
        }
    },
    initialize : function(){
        this.render();
        this.initMenu();
    },
    render : function(){
        this.el.innerHTML = this._markup;
    },
    initMenu : function(){
        this.menu = new App.Views.SideMenu({
            el : this.$(".sidebar-menu")
        });
    }
});


App.Views.SideMenu = Backbone.View.extend({
    _markup :
        "<li><span class='select-option' data-location='digest'>Digest</span></li>\
        <li><span class='select-option' data-location='feed'>Feed</span></li>\
        <li><span class='select-option' data-location='all'>All</span></li>",
    events : {
        "click .select-option" : "selectOption"
    },
    initialize : function(){
        this.render();
    },
    render : function(){
        this.el.innerHTML = this._markup;
        //this.renderTo();
    },
    selectOption : function(e){
        App.router.navigate($(e.target).data("location"), {trigger: true, replace: false});
    }
});






App.Views.Division = Backbone.View.extend({
    _markup :
        "<div class='division-header'>\
            <span class='h1'></span>\
            <span class='controls'></span>\
        </div> \
        <div class='division-output'></div>",
    events : {
        "click .post-title" : function(e){
            App.router.navigate($(e.target).parent().data("post")+"", {trigger: true, replace: false});
        }
    },
    initialize : function(){
        this.collection = new App.Collections.Posts({parent : this});
        this.collection.on("reset", this.reset, this);

        this.render();
        this.$header = this.$el.children(".division-header");
        this.$body = this.$el.children(".division-output");
        this.$h1 = this.$header.children(".h1");
        this.$controls = this.$header.children(".controls");

        this.renderHeader();
        this.renderBody();

        this.init && this.init();
        this.constructor.view = this;
    },
    render : function(){
        this.el.innerHTML = this._markup;
    },
    renderHeader : function(){
        this.$h1.html(this.label);
    },
    renderBody : function(){
        this.$body.html("text of " + this.label);
    },
    reset : function(){
        this.$body.empty();

        this.collection.forEach(function(model){
            new App.Views.Post_small({
                model    : model,
                renderTo : this.$body,
                parent   : this
            });
        }.bind(this));
    }
});


App.Views.Digest = App.Views.Division.extend({
    label : Lang.digest,
    className : "digest-view",
    init : function(){}
});

App.Views.Feed = App.Views.Division.extend({
    label : Lang.feed,
    className : "feed-view",
    init : function(){}
});

App.Views.All = App.Views.Division.extend({
    label : Lang.all,
    className : "all-view",
    init : function(){}
});







App.Views.Page_Post = Backbone.View.extend({
    className : "page-post",
    _markup:"<div class='post-page-view'>\
                <div class='page-header'>\
                    <div class='h1'></div>\
                    <div class='post-options'>\
                        <span class='post-comments'></span>\
                        <span class='post-author'></span>\
                    </div>\
                </div>\
                <div class='page-body'></div>\
            </div>\
            <div class='omnibar'>options</div>",
    initialize : function(){
        this.render();

        this.$header = this.$(".page-header");
        this.$body = this.$(".page-body");
        this.$omnibar = this.$(".omnibar");
        this.$options = this.$(".post-options");

        this.on("model", this.setModel, this);
        this.listenTo(this.model, "change", this.view);

        this.constructor.view = this;
        this.view();
    },
    setModel : function(model){
        this.stopListening(this.model);
        this.model = model;
        this.listenTo(model, "change", this.view);
        if (this.model.isNew()) this.view();
    },
    render : function(){
        this.$el.html(this._markup);
    },
    view : function(){
        this.renderHeader();
        this.renderBody();
        this.renderOmnibar();
    },
    renderHeader : function(){
        this.$header.children(".h1").html(this.model.get("title"));
        this.$header.children(".h1").append("<span class='edit-post'>edit</span>");

        this.$options.children(".post-comments").html(this.model.get("comments"));
        this.$options.children(".post-author").html(this.model.get("user_email"));
    },
    renderBody : function(){
        this.$body.html(this.model.get("text"));
    },
    renderOmnibar : function(){
        this.$omnibar.html("Omnicontent");
    }
}, {
    getView : function(model){
        var view;

        if (view = this.view)
            view.trigger("model", model);
        else
            view = new this({model : model});

        return view;
    }
});



App.Views.Post_Form = App.Views.Page_Post.extend({
    _markup:"<div class='post-page-view'>\
                <div class='page-header'>\
                    <div class='h1'></div>\
                </div>\
                <div class='page-body'>\
                    <div class='edit-controls'></div>\
                    <input type='text' class='edit-title'>\
                    <textarea class='edit-text'></textarea>\
                    <div class='edit-tags'>\
                        <h3>Edit tags</h3>\
                        <div class='tags'></div>\
                        <input type='text' class='input-tags'>\
                        <input type='button' class='add-tags' value='add'>\
                    </div>\
                </div>\
             </div>",
    events : {
        "click .post-save"   : "save",
        "click .post-delete" : function(){this.model.del();},
        "click .add-tags"    : function(){
            var value;
            if (!(value = this.$(".input-tags").val()).length) return;

            this.model.addTags(value);
            this.$(".input-tags").val("");
        }
    },
    initialize : function(){
        this.render();

        this.$header   = this.$(".page-header");
        this.$body     = this.$(".page-body");
        this.$controls = this.$(".edit-controls");
        this.$title    = this.$(".edit-title");
        this.$text     = this.$(".edit-text");
        this.$tags     = this.$(".tags");

        this.on("model", this.setModel, this);
        this.listenTo(this.model, "change", this.view);

        this.constructor.view = this;
        this.view();
    },
    view : function(){
        this.renderHeader();
        this.renderControls();
        this.renderBody();
        this.renderTags();
    },
    renderControls : function(){
        this.$controls.empty()
            .append("<input type='button' class='post-save' value='save'>")
            .append("<input type='button' class='post-delete' value='delete'>");
    },
    renderHeader : function(){
        var title = this.model.isNew() ? "New post" : "Edit " + this.model.get("title");
        this.$header.children(".h1").html(title);
    },
    renderBody : function(){
        this.$title.val(this.model.get("title") || "");
        this.$text.val(this.model.get("text") || "");
    },
    renderTags : function(){
        this.$tags.empty();
        for (var i=0;this.model.get("tags")[i];i++){
            this.$tags.append($("<span class='tag'></span>").html(this.model.get("tags")[i].name));
        }
    },
    save : function(){
        var title = this.$title.val(),
            text = this.$text.val();

        return this.model.set({
            title : title,
            text  : text
        }).save();
    }
});







window.Post = App.Models.Post = Backbone.Model.extend({
    defaults : {
        "tags"  : [],
        "title" : "",
        "text"  : ""
    },
    initialize : function(){
        //this.setupTags();
        //this.on("change:tags", this.setupTags, this);
    },
    setupTags : function(){
        //this.tags || (this.tags = new Backbone.Collection(null));
        //this.get("tags");
    },
    addTags : function(val){
        var labels = val.split(","), dfd = $.Deferred().resolve();
        if (!labels.length) return;

        labels.map(function(l){return l.trim().toLowerCase()});

        if (this.isNew()) dfd = this.save();

        return dfd.then(function(){
            return App.loader.sync("/posts/"+ this.get("id") +"/add_tags", {data: labels, type: "PUT"}).done(function(result){
                Post.builder(result);
            });
        }.bind(this));
    },
    fetch : function(){
        return Post.fetch(this.get("id"));
    },
    save : function(){
        return Post.save(this).done(function(){
            App.router.navigate(this.get("id")+"", {trigger:true, replace:true});
        }.bind(this));
    },
    del : function(){
        if (confirm("are you shure?")){
            return Post.del(this).done(function(result){
                App.router.navigate("all", {trigger:true, replace:true});
            });
        };
    }
}, {
    builder : function(obj){
        var model = Post.getMap().get(obj.id);
        if (model)
            model.set(obj);
        else {
            model = new Post(obj);
            Post.getMap().add(model);
        }
        return model;
    },
    fetch : function(target, options){
        var dfd = $.Deferred();
        App.loader.sync("/posts/" + target, options || {}).done(
            function(result){  //if (result instanceof Array) dfd.resolve(result.map(App.Models.Post.builder)) else;
                dfd.resolve(App.Models.Post.builder(result));
            }.bind(this)
        );
        return dfd;
    },
    save : function(model){
        var url  = model.isNew() ? "/posts" : "/posts/" + model.get("id"),
            type = model.isNew() ? "POST" : "PUT";

        return App.loader.sync(url, {data : {
            title : model.get("title"),
            text  : model.get("text")
        }, type : type}).done(function(result){
            model.set(result);
        });
    },
    del : function(model){
        return App.loader.sync("/posts/" + model.get("id"), {type : "DELETE"}).done(function(){
            model.trigger('destroy', model, model.collection);
        });
    },
    getMap : function(){
        return Post.map || (Post.map = new App.Collections.PostMap(null));
    }
});
App.Collections.Posts = Backbone.Collection.extend({
    model : App.Models.Post,
    initialize : function(options){
        this.parent = options.parent;
    },
    fetch : function(){
        return App.Collections.Posts.fetch(this.parent.label).done(function(result){
            this.reset(result.map(App.Models.Post.builder));
        }.bind(this));
    }
}, {
    fetch : function(dvsn){
        return App.loader.sync("/posts/" + dvsn);
    }
});

App.Collections.PostMap = Backbone.Collection.extend({
    model : App.Models.Post
});



App.Views.Post_small = Backbone.View.extend({
    className : "post-small",
    _markup : "<span class='post-title'></span>\
            <span class='post-comments'></span>\
            <span class='post-author'></span>",
    initialize : function(options){
        this.options = options;

        this.render();
        this.$el.appendTo(this.options.renderTo);
    },
    render : function(){
        this.$el.html(this._markup).data("post", this.model.get("id"));

        this.$(".post-title").html(this.model.get("title"));
        this.$(".post-comments").html(this.model.get("comments"));
        this.$(".post-author").html(this.model.get("user_email"));
    }
});

//App.Views.Post_middle = Backbone.View.extend({});










$(document).on("ready", function(){
    //App.main = new App.Views.Main();
    $("#digest").click(function(){
        App.router.navigate("/digest", {trigger: true, replace: false});
    });
});

$(function(){
    App.main = new App.Views.Main();
    App.router = new App.Router();
});






