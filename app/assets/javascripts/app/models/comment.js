window.Comment = App.Models.Comment = Backbone.Model.extend({
    initialize : function(options){
        //Comment.map || (Comment.map = new App.Collections.Comments);  // Это вроде как не нужно, карта не нужна
        //Comment.map.add(this);
    },
    save : function(){return Comment.save(this);},
    del : function(){return Comment.del(this);}
}, {
    save : function(model){
        return App.loader.sync("/posts/" + model.get("post_id") + "/comments", {
            data : model.toJSON(),
            type : "POST"
        }).then(function(result){
            model.set(result);
        });
    },
    del : function(model){
        return App.loader.sync("/posts/" + model.get("post_id") + "/comments/" + model.get("id"), {
            type : "DELETE"
        }).done(function(result){
            model.trigger("destroy");
        });
    }
});



App.Collections.Comments = Backbone.Collection.extend({
    model : Comment,
    fetch : function(){   // Понадобится, когда надо будет подгружать порциями
    }
}, {
    fetch : function(){
    }
});
