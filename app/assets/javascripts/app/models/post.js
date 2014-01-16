window.Post = App.Models.Post = Backbone.Model.extend({
    defaults : {
        "tags"  : [],
        "title" : "",
        "text"  : ""
    },
    initialize : function(){
        this.comments = new App.Collections.Comments;
    },
    open : function(){
        this.isNew() || this.fetch();
        return new App.Views.Post_Form({
            model    : this,
            renderTo : App.main.$context
        });
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
    addComment : function(obj){   // Именно создание, добавление коммента
        var comment = new Comment(_.extend(obj, {
            post_id : this.get('id')
        }));
        comment.save().done(function(){
            this.comments.add(comment);
            this.set("comments", this.comments.length);
        }.bind(this));
    },
    addComments : function(arr){    // Добаление в модель, при подгрузке например
        _.each(arr, function(obj){
            var comment = this.comments.get(obj.id);
            if (comment)
                comment.set(obj);
            else
                this.comments.add(new Comment(obj));  // Можно ли не создавать модель коммента, а просто в коллекцию пихать объект, чтобы там появилась модель
        }.bind(this));
    },
    removeTag : function(id){
        return App.loader.sync("/posts/"+ this.get("id") +"/remove_tag", {data: id, type: "PUT"}).done(function(result){
            Post.builder(result);
        });
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
                var post = Post.builder(result["post"]);
                post.addComments(result["comments"]);

                dfd.resolve(post);
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
        return Post.map || (Post.map = new App.Collections.Posts(null));      // Тут с коллекции мапа стала простая коллекция постов
    }
});





App.Collections.Posts = Backbone.Collection.extend({
    model : Post,
    initialize : function(models, options){
        options && (this.parent = options.parent);
    },
    fetch : function(){
        return App.Collections.Posts.fetch(this.parent.label).done(function(result){
            this.reset(result.map(Post.builder));
        }.bind(this));
    }
}, {
    fetch : function(dvsn){
        return App.loader.sync("/posts/" + dvsn);
    }
});


App.Collections.UserPosts = App.Collections.Posts.extend({
    fetch : function(){
        App.loader.sync("/users/" + this.model.id + "/posts", {type: "GET"}).done(function(result){
            this.reset(result.map(Post.builder));
        }.bind(this));;
    }
});