App.Views.Folder = App.Views.BASE.extend({
    className : "folder-view",
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
    setState : function(options){
        this.subType = options.type;
        this.tag     = options.tag;

        this.initCollection();
    },
    init : function(){
        this.options.type && (this.subType = this.options.type);
        this.options.tag  && (this.tag = this.options.tag);

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
        this.list = new App.Views.PostList({
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
    className : "digest-view folder-view",
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
    className : "feed-view folder-view"
});


App.Views.All = App.Views.Folder.extend({
    type      : "all",
    className : "all-view folder-view",
    label     : Lang.all,
    _markup   :
        "<div class='folder-header'>\
            <div class='search-posts'>\
                <input class='search-input' type='text' placeholder='"+ Lang.searchPosts +"'>\
                <div class='search-erase'></div>\
            </div>\
            <div class='controls'>\
                <input class='change-type news' type='button' value='"+ Lang.sort_new +"'>\
                <input class='change-type pops' type='button' value='"+ Lang.sort_pop +"'>\
            </div>\
            <div class='settings'></div>\
        </div> \
        <ul class='found-tags'>\
            <h2>Найденные теги:</h2>\
        </ul>\
        <div class='folder-body'></div>",
    events : {
        'click .change-type'  : 'toggle',
        'click .search-erase' : 'searchErase',
        'input .search-input' : '_searchInput'
    },
    initCollection : function(){

        if (!this.collection) {

            this.collection      = new PostsCollection([], {parent : this});
            this.collection.tags = new Tags([], {parent : this.collection});

            this.listenTo(this.collection.tags, "add remove reset", this.renderTags);

        }

        this.collection.reset();
        this.collection.fetch();

    },
    backend : true,
    toggle : function(){

        App.router.navigate(this.subType == "new" ? "/all/popular" : "/all", {trigger: true, replace: false});
        this.updateToggle();

    },
    updateToggle : function(){

        this.$('.change-type').removeClass("active");
        this.$(this.subType == "new" ? '.change-type.news' : '.change-type.pops').addClass("active");

    },
    _searchInput : function(){
        var value = $.trim(_.escape(this.$(".search-input").val()));

        if (value.length)
            this.find(value);
        else {
            this.collection.reset();
            this.collection.fetch();
        }

        this.$controls[value ? "hide" : "show"]();


        this.$(".search-erase")[0].style.display = value.length ? "inline-block" : "none";

    },
    find : _.debounce(function(val){

        var dfd = this.list.renderDfd || $.Deferred().resolve();

        this.collection.reset();



        dfd.done(function(val){

            this.collection.tags.reset();

            var dfd = this.collection.find(val) || $.Deferred().resolve();

            dfd.done(function(){

                setTimeout(function(){
                    if (this.waiter)
                        this.waiter.remove();
                }.bind(this), 800)

            }.bind(this));


            if (dfd.state() == "pending")
                this.waiter = new App.Views.Waiter({renderTo: this.$('.folder-header'), cssclass: "search", size: 6})


        }.bind(this, val));

    }, 250),
    searchErase : function(){
        this.$(".search-input").val("");

        this._searchInput();
    },
    renderHeader : function(){

        this.$h1.html(this.label);
        this.updateToggle();

    },
    renderTags : function(){

        this.$(".found-tags")[this.collection.tags.length ? "addClass" : "removeClass"]("found");

        if (this.tags) this.tags.renderList();
        else
            this.tags = new TagsView({
                collection : this.collection.tags,
                el         : this.$('.found-tags'),
                parent     : this
            });
    }
});

App.Views.Search = App.Views.Folder.extend({
    label    : Lang.search,
    type     : "all",
    subType  : "new",
    _markup :
        "<div class='folder-header'>\
            <div class='search-tag'></div>\
        </div>\
        <div class='folder-body'></div>",
    events : {
        "click .tag" : function(){
            App.router.navigate("/all", {trigger: true, replace: false});
        }
    },
    initCollection : function(){
        this.collection || (this.collection = new PostsCollection([], {parent : this}));

        this.collection.reset();
        this.collection.by_tag(this.tag).then(this.renderTag.bind(this));

    },
    renderTag : function(){
        var tag = this.collection.tag;

        tag && this.$(".search-tag").html(
            $("<span class='tag'></span>")
                .html(tag.get("name"))
                .data("id", tag.id)
            );
    }
})


App.Views.Bookmarks = App.Views.Folder.extend({
    type : "bookmarks",
    label : Lang.bookmarks,
    className : "bookmarks-view folder-view"
});




App.Views.Users = App.Views.Folder.extend({
    label : Lang.users,
    className : "users-view folder-view",
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
