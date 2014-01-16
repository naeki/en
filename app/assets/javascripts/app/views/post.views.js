App.Views.Post_small = App.Views.BASE.extend({
    className : "post-small",
    _markup : "<span class='post-title'></span>\
            <span class='post-comments'></span>\
            <span class='post-author'></span>",
    events : {
        "click .post-author" : function(e){
            App.router.navigate("user" + $(e.target).data("user_id"), {trigger:true, replace:false});
        },
        "click .post-title" : function(e){
            App.router.navigate($(e.target).parent().data("post")+"", {trigger: true, replace: false});
        }
    },
    init : function(){
        this.render();
        this.listenTo(this.model, "change", this.render);
    },
    render : function(){
        this.$el.html(this._markup).data("post", this.model.get("id")).appendTo(this.options.renderTo);

        this.$(".post-title").html(this.model.get("title"));
        this.$(".post-comments").html(this.model.get("comments"));
        this.$(".post-author").html(this.model.get("user_email")).data("user_id", this.model.get("user_id"));
    }
});


App.Views.PostList = App.Views.BASE.extend({
    className : "post-list",
    init : function(){
        this.render();
        this.$el.appendTo(this.options.renderTo);

        this.listenTo(this.collection, "add", this.addPost);
        this.listenTo(this.collection, "reset", this.render);
    },
    render : function(){
        this.views || (this.views = {});
        this.$el.children().detach();

        _.each(this.collection.models, this.addPost, this);
    },
    addPost : function(model){
        var view = this.views[model.cid];
        if (view)
            view.$el.appendTo(this.$el);
        else
            this.views[model.cid] = new App.Views.Post_small({
            model    : model,
            parent   : this,
            renderTo : this.$el
        })
    }
});

//App.Views.Post_middle = Backbone.View.extend({});