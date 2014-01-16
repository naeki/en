App.Views.User = App.Views.BASE.extend({
    className : "user-small",
    _markup : "<span class='user-email'></span>",
    events : {
        "click .user-email" : function(e){
            App.router.navigate("user" + $(e.target).parent().data("id"), {trigger: true, replace: false});
        }
    },
    init : function(){
        this.render();
        this.listenTo(this.model, "change", this.render);
    },
    render : function(){
        this.$el.html(this._markup).data("id", this.model.get("id")).appendTo(this.options.renderTo);

        this.$(".user-email").html(this.model.get("email"));
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