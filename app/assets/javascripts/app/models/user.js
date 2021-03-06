window.User = App.Models.User = Backbone.Model.extend({
    initialize : function(){
        this.posts       = new App.Collections.UserPosts(null, {user : this});
        this.deleted     = new App.Collections.UserDel(null,   {user : this});
        this.likes       = new App.Collections.UserLikes(null, {user : this});
        this.followers   = new App.Collections.Followers(null, {user : this});
        this.following   = new App.Collections.Following(null, {user : this});
        this.digest_tags = new Tags(null);
    },
    open : function(options){
        var collection;

        if      (!options.page || options.page == "posts")         collection = this.posts;
        else if (options.page == "deleted" && User.isMe(this))     collection = this.deleted;
        else if (options.page == "likes")                          collection = this.likes;
        else if (options.page == "followers")                      collection = this.followers;
        else if (options.page == "following" && User.isMe(this))   collection = this.following;
        else if (options.page && options.page.length){
            window.location.pathname = "user" + this.id;     // TODO: Сделано грубовато, надо, чтобы при попадании в такое недоступное место редиректить через роутер, а не путь станицы
            return;
        }

        this.loading = this.fetch();

        collection.reset();
        collection.fetchDfd = collection.fetch();

        return new App.Views.Page_User({
            model       : this,
            collection  : collection,
            renderTo    : App.main.$context,
            page        : options.page
        });
    },
    get : function(field){
        if (field == "permissions") return this.attributes[field] || this.getPermissions();
        else return this.attributes[field];
    },
    edit : function(){
        if (User.isMe(this))
            return new App.Views.User_Form({
                model    : this,
                renderTo : App.main.$context
            });
    },
    fetch : function(){
        return User.fetch(this);
    },
    follow : function(model){
        App.loader.sync("/relationships", {type : "POST", data : {
            id : model.id
        }}).then(function(result){
                return User.builder(result);
            });
    },
    unfollow : function(model){
        App.loader.sync("/relationships/" + model.id, {type : "DELETE"}).then(function(result){
                return User.builder(result);
            });
    },
    getPermissions : function(){
        var result = 0,
            old = this.attributes["permissions"];

        if (this == App.currentUser)
            result += User.ME;

        (old == result) || this.set("permissions", result);
        return result
    },
    getPhoto : function(){
        return this.get("photo") ? "data:image/jpg;base64," + this.get("photo") : (Src.userPhoto + Src.defaultUserPhoto + ".jpg");
    },
    getSmallPhoto : function(){

        var photo_id = this.get("photo_id");

        if (/^http/.test(photo_id))
            return this.get("photo_id");

        return this.get("photo_id") ? "data:image/gif;base64," + this.get("photo_id") : (Src.userPhoto + Src.defaultUserPhoto + "_s.gif");
//        return Src.userPhoto + (this.get("photo_id") || Src.defaultUserPhoto) + "_s.gif";
    },
    getNormalPhoto : function(){
        if (this.get("provider") == "google_oauth2")
            return this.get("photo_id") + "?sz=120";

        return this.get("photo") ? "data:image/jpg;base64," + this.get("photo") : (Src.userPhoto + Src.defaultUserPhoto + "_n.jpg");
//        return Src.userPhoto + (this.get("photo_id") || Src.defaultUserPhoto) + "_n.jpg";
    },

    addTag : function(tag){
        if (this.digest_tags.get(tag.id)) return;

        this.digest_tags.add(tag);

        return App.loader.sync("/digest_settings/add_tag", {
            data: {data: {tag_id: tag.id}},
            type: "POST"
        }).fail(function(){
            this.digest_tags.remove(tag);
        }.bind(this));
    },
    removeTag : function(id){
        var tag = this.digest_tags.get(id);
        if (!tag) return;

        this.digest_tags.remove(tag);

        return App.loader.sync("/digest_settings/remove_tag", {
            data: {data: {tag_id: id}},
            type: "DELETE"
        }).fail(function(){
            this.digest_tags.add(tag);
        }.bind(this));
    }
}, {
    ME : 1,
    isMe : function(model){
        return model.get("permissions")&User.ME;
    },
    builder : function(obj){
        obj || (obj = {});

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
        return App.loader.sync("/users/find", {data : {id: model.get("id")}, type : "GET"}).then(function(result){
            return $.Deferred().resolve(model.set(result.user));         // Надо еще иметь сразу кол-во постов
        });
    },
    getMap : function(){
        return User.map || (User.map = new App.Collections.Users(null));
    }
});

App.Collections.Users = Backbone.Collection.extend({
    model : User,
    initialize : function(models, options){
        options && (this.user = options.user);
    },
    fetch : function(){
        App.loader.sync("/users/all", {type: "GET"}).done(function(result){
            this.reset(result.map(User.builder));
        }.bind(this));
    }
});

App.Collections.Followers = App.Collections.Users.extend({
    fetch : function(){
        App.loader.sync("/users/followers", {data: {id: this.user.id}, type: "GET"}).done(function(result){
            this.reset(result.map(User.builder));
        }.bind(this));
    }
});

App.Collections.Following = App.Collections.Users.extend({
    fetch : function(){
        App.loader.sync("/users/following", {data: {id: this.user.id}, type: "GET"}).done(function(result){
            this.reset(result.map(User.builder));
        }.bind(this));
    }
});


App.Collections.PostLikes = App.Collections.Users.extend({
    fetch : function(){
        App.loader.sync("/posts/likes", {data: {id: this.model.id}, type: "GET"}).done(function(result){
            this.reset(result.map(User.builder));
        }.bind(this));
    }
});