window.User = App.Models.User = Backbone.Model.extend({
    initialize : function(){
        this.posts     = new App.Collections.UserPosts(null, {model : this});
        this.followers = new App.Collections.Followers(null, {model : this});
        this.following = new App.Collections.Following(null, {model : this});
    },
    open : function(options){
        var collection;

        if (!options.page || options.page == "posts") collection = this.posts;
        if (options.page == "followers")              collection = this.followers;
        if (options.page == "following")               collection = this.following;

        this.fetch();
        collection.fetch();

        return new App.Views.Page_User({
            model       : this,
            collection  : collection,
            renderTo    : App.main.$context,
            page        : options.page
        });
    },
    edit : function(){
        return new App.Views.User_Form({
            model    : this,
            renderTo : App.main.$context
        });
    },
    fetch : function(){
        return User.fetch(this);
    }
}, {
    builder : function(obj){
        var model = User.getMap().get(obj.id);
        if (model)
            model.set(obj);
        else {
            model = new User(obj);
            User.getMap().add(model);
        }
        return model;
    },
    fetch : function(model){
        return App.loader.sync("/users/" + model.get("id"), {type : "GET"}).then(function(result){
            //model.posts.add(result.posts.map(Post.builder));        // Перенести это и фолловеров в отдельные коллекции, чтобы их фетчить(коллекции), а не из модели фетчить
            return $.Deferred().resolve(model.set(result.user));
        });
    },
    getMap : function(){
        return User.map || (User.map = new App.Collections.Users(null));
    }
});

App.Collections.Users = Backbone.Collection.extend({
    model : User,
    fetch : function(){
        App.loader.sync("/users/all", {type: "GET"}).done(function(result){
            this.reset(result.map(User.builder));
        }.bind(this));
    }
});

App.Collections.Followers = App.Collections.Users.extend({
    fetch : function(){
        App.loader.sync("/users/" + this.model.id + "/followers", {type: "GET"}).done(function(result){
            this.reset(result.map(User.builder));
        }.bind(this));
    }
});

App.Collections.Following = App.Collections.Users.extend({
    fetch : function(){
        App.loader.sync("/users/" + this.model.id + "/following", {type: "GET"}).done(function(result){
            this.reset(result.map(User.builder));
        }.bind(this));
    }
});