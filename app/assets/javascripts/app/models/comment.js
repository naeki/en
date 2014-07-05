window.Comment = App.Models.Comment = Backbone.Model.extend({
    initialize : function(options){

        this.user = User.builder({
            id       : this.get("user_id"),
            name     : this.get("user_name"),
            photo_id : this.get("user_photo_id")
        });

        //Comment.map || (Comment.map = new App.Collections.Comments);  // Это вроде как не нужно, карта не нужна
        //Comment.map.add(this);
    },
    save : function(){return Comment.save(this);},
    del : function(){return Comment.del(this);}
}, {
    save : function(model){
        return App.loader.sync("/posts/" + model.get("post_id") + "/comments", {
            data : {data : model.toJSON()},
            type : "POST"
        }).then(function(result){
            model.set(result);
            model.user.set({
                id       : model.get("user_id"),
                name     : model.get("user_name"),
                photo_id : model.get("user_photo_id")
            });
        });
    },
    del : function(model){
        return App.loader.sync("/posts/" + model.get("post_id") + "/comments/" + model.get("id"), {
            type : "DELETE"
        }).done(function(){
            model.trigger("destroy");
        });
    }
});



App.Collections.Comments = Backbone.Collection.extend({
    model : Comment,
    fetch : function(){   // Понадобится, когда надо будет подгружать порциями
        return App.loader.sync("/posts/comments", {data: {id: this.model.id}, type: "GET"}).done(function(result){
            _.each(result, function(obj){
                var comment = this.get(obj.id);
                if (comment)
                    comment.set(obj);
                else
                    this.add(new Comment(obj));
            }, this);
        }.bind(this));
    }
}, {
    fetch : function(){
    }
});
