window.AA = {};




window.Post = App.Models.Post = Backbone.Model.extend({
    defaults : {
        "tags"  : [],
        "title" : "",
        "text"  : ""
    },
    _defaults : {
        title: Lang.defaults.title
    },
    initialize : function(){
        this.comments = new App.Collections.Comments(null, {model: this});
        this.likes    = new App.Collections.PostLikes(null, {model: this});
        this.tags     = new Tags(null);

        this.getPermissions();
        this.duplicate();

        this.on("change:user_id", this.getPermissions, this);
    },


    duplicate : function(){
        var attrs = this.attributes;

        this.on("resetState", function() {

            return attrs;

        }.bind(this));

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
        else
            this.loading = this.fetch().then(function(){

                this.getPermissions();

                return this.get("permissions")&Post.OWNER ? view_form.call(this) : view_page.call(this)

            }.bind(this));

    },
    open_comments : function(){

        this.loading = this.fetch().then(function(){

            return new App.Views.Comments({
                renderTo   : App.main.$context,
                model      : this,
                collection : this.comments
            })

        }.bind(this));
    },
    fetch : function(){
        return Post.fetch(this.get("id"));
    },
    save : function(){

        if (this.isNew()){

            if (!this.get("title")) this.set("title", this._defaults.title);

        }

        return Post.save(this).done(function(){
            App.router.navigate(this.get("id")+"", {trigger:false, replace:true});
        }.bind(this));
    },
    del : function(){
        if (confirm(Lang.confirm)){
            this.set('deleted', 1);
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
        return this.get("photo_id") && (this.get("photo_id") + "_o.jpg") || "";
    },
    getSmallPhoto : function(){
        return this.get("photo_id") && (this.get("photo_id") + "_q.jpg") || "";
    },
    getNormalPhoto : function(){
        return this.get("photo_id") && (this.get("photo_id") + "_n.jpg") || "";
    },
    getBigPhoto : function(){
        return this.get("photo_id") && (this.get("photo_id") + "_b.jpg") || "";
    },

    deletePicture : function(){

        this.set("photo_id", null);
        var data = {id : this.id};

        return App.loader.sync("posts/picture", {data: data, type: "DELETE"})
            .done(function(result){
                this.trigger("delete", result);
            }.bind(this));



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

        var tags = labels.map(function(label){return {name: label}});

        return dfd.then(function(){
            this.tags.add(tags);

            return App.loader.sync("/posts/"+ this.id +"/add_tags", {
                data: {data: {labels: labels}},
                type: "PUT"
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
    },

    setDeleted : function(){
        this.set("deleted", this.get("deleted") ? 0 : 1);

        return Post[this.get("deleted") ? "del" : "ret"](this);
    }
}, {
    OWNER : 1,
    frontAttributes : ["permissions", "user_name", "user_photo_id", "tags", "id", "comments", "likes", "last_view", "short_text"],
    getDateString : function(ts){
        var date = new Date(ts * 1000);
        return Post.getShortDate(ts) + " &nbsp; " + Post.getOTime(date.getHours()) + ":" + Post.getOTime(date.getMinutes());
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
        return App.loader.sync("/posts/setDeleted", {type : "POST", data: {id: model.get("id"), deleted: true}}).done(function(result){
            Post.builder(result);
        });
    },
    // return from deleted
    ret : function(model){
        return App.loader.sync("/posts/setDeleted", {type : "POST", data: {id: model.get("id"), deleted: false}}).done(function(result){
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

        this.on("reset", function(){
            delete this.end;
        }.bind(this))
    },
    by_tag : function(id){

        this.fetchDfd = PostsCollection.get("/tags", {data: {tag_id: id}}).then(function(result){

            this.tag = new Tag(result.tag);
            this.addModels(result.posts);

        }.bind(this));

        this.trigger("fetch");

        this.state = {
            method : "by_tag",
            args   : arguments
        };

        return this.fetchDfd;

    },



    find : function(str){

        if (this.fetchDfd || this.end) return;

        if (str.length<3 && this.results) {

            delete this.results;
            this.reset();

            this.fetchDfd = this.fetch();

            return this.fetchDfd;
        }



        if (str.length>2) {

//            this.reset();


            this.fetchDfd = PostsCollection.get("/posts/find", {
                data: {
                    string : str,
                    offset : this.length,
                    limit  : this.limit
                }
            })
                .done(function (result) {

                    this.addModels(result.posts);
                    this.tags.reset(result.tags);

                }.bind(this));



            this.trigger("search");


            this.state = {
                method : "find",
                args   : arguments
            };


            return this.fetchDfd;
        }


        return $.Deferred().resolve();



    },

    addModels : function(posts){
        if (posts.length < this.limit)
            this.end = true;

        var models = posts.map(Post.builder);

        this.add(models);
        this.trigger("before:reset", models);


        delete this.fetchDfd;
    },




    limit: 3,
    fetch : function(url, data){

        if (this.fetchDfd || this.end) return;



        if (!url) {

            var url = ("/posts/" + this.parent.type);

            if (this.parent.subType)
                url += "/" + this.parent.subType;
        }


        this.fetchDfd = PostsCollection.get(url, {
            data : _.extend(
                {
                    offset: this.length,
                    limit: this.limit
                },
                data || {}
            )
        })
            .done(function(result){
                this.addModels(result.posts);
            }.bind(this));


        this.trigger("fetch");

        this.state = {
                method : "fetch",
                args   : arguments
            };

        return this.fetchDfd;
    },





    fetchPage : function(){
        return this[this.state.method].apply(this, this.state["args"]);
    }




}, {
    get : function(url, options){
        return App.loader.sync(url, options);
    }
});



// Posts of user
App.Collections.UserPosts = App.Collections.Posts.extend({
    fetch : function(){
        return App.Collections.Posts.prototype.fetch.call(this, "/users/posts", {id: this.user.id});
    }
});

App.Collections.UserDel = App.Collections.Posts.extend({
    fetch : function(){
        return App.loader.sync("/users/posts", {data : {id: this.user.id, options: {deleted : 1}}, type: "GET"}).done(function(result){
            this.reset((result.posts || result).map(Post.builder));
        }.bind(this));
    }
});

// Likes posts of user
App.Collections.UserLikes = App.Collections.Posts.extend({
    fetch : function(){
        return App.loader.sync("/users/likes", {data : {id: this.user.id}, type: "GET"}).done(function(result){
            this.reset((result.posts || result).map(Post.builder));
        }.bind(this));
    }
});