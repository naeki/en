App.Views.Folder = App.Views.BASE.extend({
    _markup :
        "<div class='folder-header'>\
            <span class='h1'></span>\
            <span class='controls'></span>\
            <div class='settings'></div>\
        </div> \
        <div class='folder-body'></div>",
    events : {},
    initCollection : function(){
        this.collection || (this.collection = new PostsCollection([], {parent : this}));

        this.collection.reset();
        this.collection.fetch();
    },
    setState : function(type){
        this.subType = type;
        this.initCollection();
    },
    init : function(){
        this.subType = this.options.subType;

        this.render();

        this.$header   = this.$el.children(".folder-header");
        this.$body     = this.$el.children(".folder-body");
        this.$h1       = this.$header.children(".h1");
        this.$controls = this.$header.children(".controls");

        this.initCollection();
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




App.Views.Digest = App.Views.Folder.extend({
    type : "digest",
    _markup :
        "<div class='folder-header'>\
            <span class='h1'></span>\
            <div class='controls'>\
                <div class='edit-tags'></div>\
            </div>\
            <div class='settings'></div>\
        </div> \
        <div class='folder-body'></div>",
    label : Lang.digest,
    className : "digest-view",
    renderHeader : function(){
        this.$h1.html(this.label);

        new App.Views.TagsControl({
            parent     : this,
            renderTo   : this.$(".edit-tags"),
            model      : App.currentUser,
            collection : App.currentUser.digest_tags
        });
    }
});


App.Views.Feed = App.Views.Folder.extend({
    type : "feed",
    label : Lang.feed,
    className : "feed-view"
});


App.Views.All = App.Views.Folder.extend({
    type : "all",
    _markup :
        "<div class='folder-header'>\
            <span class='h1'></span>\
            <span class='controls'>\
                <input class='change-type' type='button' value='liked'>\
                <input class='search-posts' type='text' placeholder='search'>\
            </span>\
            <div class='settings'></div>\
        </div> \
        <div class='folder-body'></div>",
    label : Lang.all,
    events : {
        'click .change-type'  : 'toggle',
        'input .search-posts' : 'find'
    },
    backend : true,
    toggle : function(){
        App.router.navigate(this.subType == "new" ? "/all/popular" : "/all", {trigger: true, replace: false});
        this.updateToggle();
    },
    find : function(){
        this.collection.find($(".search-posts").val());
    },
    className : "all-view",
    updateToggle : function(){
        this.$('.change-type').val(this.subType == "new" ? 'popular' : 'last added');
    },
    renderHeader : function(){
        this.$h1.html(this.label);
        this.updateToggle();

        new App.Views.TagsControl({
            parent     : this,
            renderTo   : this.$(".edit-tags"),
            model      : App.currentUser,
            collection : App.currentUser.digest_tags
        });
    }
});


App.Views.Bookmarks = App.Views.Folder.extend({
    type : "bookmarks",
    label : Lang.bookmarks,
    className : "bookmarks-view"
});




App.Views.Users = App.Views.Folder.extend({
    label : Lang.users,
    className : "users-view",
    initCollection : function(){
        this.collection || (this.collection = new App.Collections.Users(null, {parent : this}));
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
