App.Views.Division = App.Views.BASE.extend({
    _markup :
        "<div class='division-header'>\
            <span class='h1'></span>\
            <span class='controls'></span>\
        </div> \
        <div class='division-body'></div>",
    events : {},
    initCollection : function(){
        this.collection || (this.collection = new App.Collections.Posts([], {parent : this}));
        this.collection.fetch();
    },
    init : function(){
        this.initCollection();
        this.render();

        this.$header   = this.$el.children(".division-header");
        this.$body     = this.$el.children(".division-body");
        this.$h1       = this.$header.children(".h1");
        this.$controls = this.$header.children(".controls");

        this.renderHeader();
        this.renderBody();

        //this.posts = {};
        this.constructor.view = this;
    },
    render : function(){
        this.el.innerHTML = this._markup;
    },
    renderHeader : function(){
        this.$h1.html(this.label);
    },
    renderBody : function(){
        new App.Views.PostList({
            collection : this.collection,
            parent     : this,
            renderTo   : this.$body
        })
    }
});




App.Views.Digest = App.Views.Division.extend({
    label : Lang.digest,
    className : "digest-view",
    setup : function(){}
});


App.Views.Feed = App.Views.Division.extend({
    label : Lang.feed,
    className : "feed-view",
    setup : function(){}
});


App.Views.All = App.Views.Division.extend({
    label : Lang.all,
    className : "all-view",
    setup : function(){}
});




App.Views.Users = App.Views.Division.extend({
    label : Lang.users,
    className : "users-view",
    initCollection : function(){
        this.collection || (this.collection = new App.Collections.Users({parent : this}));
        this.collection.fetch();
    },
    setup : function(){},
    renderBody : function(){
        new App.Views.UserList({
            collection : this.collection,
            parent     : this,
            renderTo   : this.$body
        })
    }
});
