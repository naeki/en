App.Views.Main = Backbone.View.extend({
    className : "main",
    _markup : "<aside class='sidebar'></aside>\
               <div class='context'></div>",
    events : {
        "click .user-link" : function(e){
            App.router.navigate("user" + $(e.target).data("user-id"), {trigger:true, replace:false});
        }
    },
    initialize : function(){
        this.render();
        this.$context = this.$el.children(".context");

        new App.Views.Sidebar({
            el : this.$(".sidebar")
        });
    },
    render : function(){
        this.$el.html(this._markup);
        $("body").html(this.$el);
    },
    open : function(options){
        var dfd = $.Deferred().resolve();
        if (App.loader.dfd.current_user.state() == "pending") return App.loader.dfd.current_user.done(function(){
            this.open(options);
        }.bind(this));

        this.clearContext();

        if (options.post) {
            dfd = this.openPost(options);
            this.$el.addClass("clear loading"); // Грубо, но правда
        }
        if (options.user) this.openUser(options);
        if (options.dvsn) this.openDivision(options);


        dfd.done(function(){
            if (this.current_view){
                this.current_view.model.loading.done(function(){
                    this.$el.removeClass("loading");
                }.bind(this));
            }
        }.bind(this));
    },
    openPost : function(options){
        var post = Post.builder(options.post === "new" ? {} : {id : options.post});

        post.open();
        return post.loading.done(function(view){
            this.current_view = view;
        }.bind(this));
    },
    openUser : function(options){
        this.current_view = User.builder({id : parseInt(options.user)}).open({page: options.page});
    },
    openDivision : function(options){
        var view;

        if (view = this.divView = options.dvsn.view) {
            view.options.subType = options.type;
            view.initCollection();
        }
        else view = this.divView = new options.dvsn({subType: options.type});

        this.$context.html(view.$el);
    },
    editProfile : function(){
        this.clearContext();
        this.$el.addClass("clear");
        this.current_view = App.currentUser.edit();
    },
    clearContext : function(){
        this.$context[0].innerHTML = "";
        this.$el.removeClass("clear");
        if (this.current_view) {
            this.current_view.remove();   // Пока что все удаляется, но надо будет, чтобы не все удалялось. Можно некоторые страницы держать в памяти
            delete this.current_view;
        }
    },
    _setTitle : function(text){
        document.title = text;
    }
});



// SIDEBAR
App.Views.Sidebar = Backbone.View.extend({
    _markup : "\
        <div class='user-box'>\
            <img class='user-photo-middle user-link'>\
            <span class='user-name user-link'></span>\
            <a href='/signout' data-method='delete' class='link signout' rel='nofollow'>"+ Lang.signout +"</a>\
        </div>\
        <ul class='sidebar-menu'></ul>\
        <ul class='sidebar-small-menu'>\
            <li><span class='new-post'>"+ Lang.new_post +"</span></li>\
            <li><span class='users'>"+ Lang.users +"</span></li>\
        </ul>",
    events : {
        "click .new-post" : function(){
            App.router.navigate("new", {trigger:true, replace:false});
        },
        "click .users" : function(){
            App.router.navigate("users", {trigger:true, replace:false});
        }
    },
    initialize : function(){
        this.render();

        this.$userPhoto = this.$('.user-photo-middle');
        this.$userName  = this.$('.user-name');

        this.listenTo(App.currentUser, "change:name change:photo_id", this.renderUserbox);

        this.initMenu();
        this.renderUserbox();
    },
    render : function(){
        this.el.innerHTML = this._markup;
    },
    renderUserbox : function(){
        this.$userPhoto.attr({
            src : App.currentUser.getSmallPhoto(),
            alt : App.currentUser.get("name")
        }).data("user-id", App.currentUser.id);

        this.$userName.html(App.currentUser.get("name")).data("user-id", App.currentUser.id);
    },
    initMenu : function(){
        new App.Views.SideMenu({
            el : this.$(".sidebar-menu")
        });
    }
});



// MAIN MENU
App.Views.SideMenu = Backbone.View.extend({
    _markup :
        "<li><span class='select-option' data-location='digest'>"+ Lang.digest +"</span></li>\
        <li><span class='select-option' data-location='bookmarks'>"+ Lang.bookmarks +"</span></li>\
        <li><span class='select-option' data-location='feed'>"+ Lang.feed +"</span></li>\
        <li><span class='select-option' data-location='all'>"+ Lang.all +"</span></li>",
    events : {
        "click .select-option" : "selectOption"
    },
    initialize : function(){
        this.render();
    },
    render : function(){
        this.el.innerHTML = this._markup;
    },
    selectOption : function(e){
        App.router.navigate($(e.target).data("location"), {trigger: true, replace: false});
    }
});