App.Views.Main = Backbone.View.extend({
    className : "main",
    _markup : "\
               <img class='user-photo-middle user-link common-user-box'>\
               <div class='context'></div>\
               <div class='sidebar-container'>" +
                    App.SVG.logo +
                   "<aside class='sidebar'></aside>\
               </div>",
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

        this.$(".common-user-box").attr({
            src : App.currentUser.getSmallPhoto(),
            alt : App.currentUser.get("name")
        }).data("user-id", App.currentUser.id);

    },
    open : function(options){
        var dfd = $.Deferred().resolve();
        if (App.loader.dfd.current_user.state() == "pending") return App.loader.dfd.current_user.done(function(){
            this.open(options);
        }.bind(this));

        this.clearContext();

        if (options.post) {
            dfd = this.openPost(options);
            this.$el.addClass("clear loading"); // Грубо, но правда (видимо надо определять, надо ли подгружать.. ну и вообще наверное не здесь делать, а во вьюшке поста)
        }
        if (options.user) this.openUser(options);
        if (options.folder) this.openFolder(options);


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
    openFolder : function(options){
        var view,
            settings = _.omit(options, "folder");

        if (view = options.folder.view) {
            view.setState(settings);
        }
        else view = new options.folder(settings);

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
        <div class='footer'>\
            <ul class='sidebar-menu'></ul>\
            <ul class='sidebar-small-menu'>\
                <li><span class='new-post'>"+ Lang.new_post +"</span></li>\
                <li><span class='users'>"+ Lang.users +"</span></li>\
                <li><span class='search'>"+ Lang.search +"</span></li>\
            </ul>\
        </div>",
    events : {
        "click .new-post" : function(){
            App.router.navigate("new", {trigger:true, replace:false});
        },
        "click .users" : function(){
            App.router.navigate("users", {trigger:true, replace:false});
        },
        "click .search" : function(){
            App.router.navigate("search", {trigger:true, replace:false});
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