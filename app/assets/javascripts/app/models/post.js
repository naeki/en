window.Post = App.Models.Post = Backbone.Model.extend({
    defaults : {
        "tags"  : [],
        "title" : "",
        "text"  : ""
    },
    initialize : function(){
        this.comments = new App.Collections.Comments(null, {model: this});
        this.likes    = new App.Collections.PostLikes(null, {model: this});
        this.tags     = new Tags(null);

        this.getPermissions();

        this.on("change:user_id", this.getPermissions, this);
    },
    open : function(){
        var view_form = function(){
                return new App.Views.Post_Form({
                    model    : this,
                    renderTo : App.main.$context
                });
            },
            view_page = function(){
                return new App.Views.Page_Post({
                    model    : this,
                    renderTo : App.main.$context
                });
            };

        this.loading = new $.Deferred();

        if (this.isNew())
            return this.loading.resolve(view_form.call(this));
        else{
            this.loading = this.fetch().then(function(){
                return $.Deferred().resolve(this.get("permissions")&Post.OWNER ? view_form.call(this) : view_page.call(this));
            }.bind(this));
        }
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
        if (confirm(Lang.confirm)){
            this.set('deleted', true);
            return Post.save(this).done(function(result){
                //App.router.navigate("all", {trigger:true, replace:true});
            });
        };
    },
    ret : function(){
        this.set({'deleted': false, "access": 0});
        return Post.save(this).done(function(result){
            //App.router.navigate("all", {trigger:true, replace:true});
        });
    },
    getPermissions : function(){
        var result = 0;

        if (this.get("user_id") == App.currentUser.id)
            result += Post.OWNER;

        return this.set("permissions", result);
    },
    getPhoto : function(){
        return this.get("photo_id") && (this.get("photo_id") + "_o.jpg");
    },
    getSmallPhoto : function(){
        return this.get("photo_id") && (this.get("photo_id") + "_q.jpg");
    },
    getNormalPhoto : function(){
        return this.get("photo_id") && (this.get("photo_id") + "_n.jpg");
    },
    getBigPhoto : function(){
        return this.get("photo_id") && (this.get("photo_id") + "_b.jpg");
    },



    // TAGS
    addTag : function(model){
        // Чтобы добавлять по айди уже известную модель вместо присвоения на основе имени
    },
    addTags : function(val){
        var labels = val.split(","),
            dfd = $.Deferred().resolve();

        if (!labels.length) return;
        labels = labels.map(function(l){return l.trim().toLowerCase()});

        if (this.isNew()) dfd = this.save();

        return dfd.then(function(){
            return App.loader.sync("/posts/"+ this.id +"/add_tags", {
                data: {data: {labels: labels}},
                type: "PUT"
            }).done(function(result){
                    Post.builder(result);
                });
        }.bind(this));
    },
    removeTag : function(id){
        return App.loader.sync("/posts/"+ this.id +"/remove_tag", {
            data: {data: {tag_id: id}},
            type: "PUT"
        }).done(function(result){
            Post.builder(result);
        });
    },



    // COMMENTS
    addComment : function(obj){   // Именно создание, добавление коммента
        var comment = new Comment(_.extend(obj, {
            post_id : this.get('id')
        }));
        comment.save().done(function(){
            this.comments.add(comment);
            this.set("comments", this.comments.length);
        }.bind(this));
    },



    // LIKES
    iLike : function(){
        return App.currentUser.get("likes").indexOf(this.id) != -1;
    },
    like : function(){
        if (this.iLike()) return false;

        return App.loader.sync("/likes", {data: {post_id: this.id}, type: "POST"}).done(function(result){
            User.builder(result);
            this.set("likes", this.get("likes")+1);
        }.bind(this));
    },
    unlike : function(){
        if (!this.iLike()) return false;

        return App.loader.sync("/likes", {data: {post_id: this.id}, type: "DELETE"}).done(function(result){
            User.builder(result);
            this.set("likes", this.get("likes")-1);
        }.bind(this));
    },


    // BOOKMARKS
    iAdded : function(){
        return App.currentUser.get("bookmarks").indexOf(this.id) != -1;
    },
    addBookmark : function(){
        if (this.iAdded()) return false;

        return App.loader.sync("/bookmarks", {data: {post_id: this.id}, type: "POST"}).done(function(result){
            User.builder(result);
            this.trigger("change:bookmarks");
        }.bind(this));
    },
    removeBookmark : function(){
        if (!this.iAdded()) return false;

        return App.loader.sync("/bookmarks", {data: {post_id: this.id}, type: "DELETE"}).done(function(result){
            User.builder(result);
            this.trigger("change:bookmarks");
        }.bind(this));
    },
    getLikes : function(){
        return User.getMap();
    }
}, {
    OWNER : 1,
    frontAttributes : ["permissions", "user_name", "user_photo_id", "tags", "id", "comments", "likes", "last_view", "short_text"],
    getDateString : function(ts){
        var date = new Date(ts * 1000);
        return Post.getShortDate(ts) + " | " + Post.getOTime(date.getHours()) + ":" + Post.getOTime(date.getMinutes());
    },
    getShortDate : function(ts){
        var date = typeof(ts) == "string" ? new Date(ts) : new Date(ts * 1000);
        return date.getDate() + " " + Lang.months[date.getMonth()] + " " + date.getFullYear();
    },
    getOTime : function(num){
        return num.toString().length > 1 ? num : '0'+num
    },
    builder : function(obj){
        var model = Post.getMap().get(obj.id);
        if (model)
            model.set(obj);
        else {
            model = new Post(obj);
            Post.getMap().add(model);
        }

        model.tags.set(obj.tags);

        if (obj.user_id)
            model.user = User.builder({
                id       : obj.user_id,
                name     : obj.user_name,
                photo_id : obj.user_photo_id
            });
        else
            model.user = App.currentUser;

        return model;
    },
    fetch : function(target, options){
        var dfd = $.Deferred();
        App.loader.sync("/posts/" + target, options || {}).done(
            function(result){
                var post = Post.builder(result);
                dfd.resolve(post);
            }.bind(this)
        );
        return dfd;
    },
    save : function(model){
        var url  = model.isNew() ? "/posts" : "/posts/" + model.get("id"),
            type = model.isNew() ? "POST" : "PUT",
            data = {
                data : _.omit(model.toJSON(), Post.frontAttributes)
            };

        // All fields? seriously?
        return App.loader.sync(url, {data: data, type: type}).done(function(result){
                model.set(result);
            });
    },
    // Delete (deleted=true)
    del : function(model){
        return App.loader.sync("/posts/" + model.get("id"), {type : "DELETE"}).done(function(result){
            Post.builder(result);
        });
    },
    // return from deleted
    ret : function(model){
        return App.loader.sync("/posts/" + model.get("id"), {type : "DELETE"}).done(function(result){
            Post.builder(result);
        });
    },
    getMap : function(){
        return Post.map || (Post.map = new App.Collections.Posts(null));
    }
});





window.PostsCollection = App.Collections.Posts = Backbone.Collection.extend({
    model : Post,
    initialize : function(models, options){
        options && (this.parent = options.parent);
        options && (this.user = options.user);
    },
    by_tag : function(id){
        return PostsCollection.fetch("/tags", {data: {tag_id: id}}).then(function(result){
            this.tag = new Tag(result.tag);
            this.reset(result.posts.map(Post.builder));
            return $.Deferred().resolve();
        }.bind(this));
    },
    find : function(str){
        if (!str.length) return this.fetch();

        PostsCollection.fetch("/posts/find", {data: {string: str}}).done(function(result){
            this.reset(result.posts.map(Post.builder));
            this.tags.reset(result.tags);
        }.bind(this));
    },
    fetch : function(){
        var url = "/posts/" + this.parent.type;

        if (this.parent.subType) url += "/" + this.parent.subType;

        return PostsCollection.fetch(url).done(function(result){
            this.reset(result.map(Post.builder));
        }.bind(this));
    }
}, {
    fetch : function(url, options){
        return App.loader.sync(url, options);
    }
});



// Posts of user
App.Collections.UserPosts = App.Collections.Posts.extend({
    fetch : function(){
        App.loader.sync("/users/posts", {data : {id: this.user.id}, type: "GET"}).done(function(result){
            this.reset((result.posts || result).map(Post.builder));
        }.bind(this));
    }
});

App.Collections.UserDel = App.Collections.Posts.extend({
    fetch : function(){
        App.loader.sync("/users/posts", {data : {
            id: this.model.id,
            options: {
                deleted : true
            }
        }, type: "GET"}).done(function(result){
            this.reset(result.map(Post.builder));
        }.bind(this));
    }
});

// Likes posts of user
App.Collections.UserLikes = App.Collections.Posts.extend({
    fetch : function(){
        App.loader.sync("/users/likes", {data : {id: this.model.id}, type: "GET"}).done(function(result){
            this.reset(result.map(Post.builder));
        }.bind(this));;
    }
});