App.Views.User = App.Views.BASE.extend({
    className : "user-small",
    _markup : "<img class='user-photo-big user-link'>\
        <span class='link user-name user-link'></span>\
        <div class='user-stat'>\
            <span class='user-stat-posts user-stat'></span>\
            <span class='user-stat-likes user-stat'></span>\
        </div>",
    events : {},
    init : function(){
        this.render();
        this.listenTo(this.model, "change", this.render);
    },
    render : function(){
        this.$el.html($(this._markup).data("user-id", this.model.get("id"))).appendTo(this.options.renderTo);

        this.$(".user-photo-big").attr({
            src : this.model.getNormalPhoto(),
            alt : this.model.get("name")
        }).data("user-id", this.model.id);

        this.$(".user-name").html(this.model.get("name"));
        this.$(".user-stat-posts").html(this.model.get("posts_count"));
        this.$(".user-stat-likes").html(this.model.get("likes_count"));
    }
});



App.Views.UserList = App.Views.BASE.extend({
    className : "user-list",
    init : function(){
        this.render();
        this.$el.appendTo(this.options.renderTo);

        this.listenTo(this.collection, "add", this.addUser);
        this.listenTo(this.collection, "reset", this.render);
    },
    render : function(){
        this.views || (this.views = {});
        this.$el.children().detach();

        _.each(this.collection.models, this.addUser, this);
    },
    addUser : function(model){
        var view = this.views[model.cid];
        if (view)
            view.$el.appendTo(this.$el);
        else
            this.views[model.cid] = new App.Views.User({
                model    : model,
                parent   : this,
                renderTo : this.$el
            });
    }
});



