App.Views.Main = Backbone.View.extend({
    className : "main",
    _markup : "<aside class='sidebar'>Sidebar</aside>\
               <div class='context'>Hello</div>",
    initialize : function(){
        this.render();
        this.$context = this.$el.children(".context");
        this.sidebar = new App.Views.Sidebar({
            el : this.$(".sidebar")
        });
    },
    render : function(){
        this.$el.html(this._markup);
        $("body").html(this.$el);
    },
    open : function(options){
        this.clearContext();

        if (options.post) this.openPost(options);
        if (options.user) this.openUser(options);
        if (options.dvsn) this.openDivision(options);
    },
    openPost : function(options){
        this.current_view = Post.builder(options.post === "new" ? {} : {id : options.post}).open();  // не факт, что надо открывать через модель, ну да ладно
    },
    openUser : function(options){
        this.current_view = User.builder({id : parseInt(options.user)}).open({page: options.page});
    },
    openDivision : function(options){
        var view;

        if (view = options.dvsn.view) view.initCollection();
        else view = new options.dvsn;

        this.$context.html(view.$el);
    },
    editProfile : function(){
        this.clearContext();
        this.current_view = App.currentUser.edit();
    },
    clearContext : function(){
        this.$context[0].innerHTML = "";
        if (this.current_view) this.current_view.remove();   // Пока что все удаляется, но надо будет, чтобы не все удалялось. Можно некоторые страницы держать в памяти
    },
    _setTitle : function(text){
        document.title = text;
    }
});



// SIDEBAR
App.Views.Sidebar = Backbone.View.extend({
    _markup : "\
        <div class='user-box'></div>\
        <ul class='sidebar-menu'></ul>\
        <span class='new-post'>New post</span><br>\
        <span class='link users'>Users</span>",
    events : {
        "click .new-post" : function(){
            App.router.navigate("new", {trigger:true, replace:false});
        },
        "click .user-link" : function(){
            App.router.navigate("user" + App.currentUser.get("id"), {trigger:true, replace:false});
        },
        "click .users" : function(){
            App.router.navigate("users", {trigger:true, replace:false});
        }
    },
    initialize : function(){
        this.render();
        this.initMenu();
        this.initUserbox();
    },
    render : function(){
        this.el.innerHTML = this._markup;
    },
    initUserbox : function(){
        this.$(".user-box").html($("<span class='user-link'>"+ App.currentUser.get("email") +"</span>")); //Сделать линк через дата:ид
    },
    initMenu : function(){
        this.menu = new App.Views.SideMenu({
            el : this.$(".sidebar-menu")
        });
    }
});



// MAIN MENU
App.Views.SideMenu = Backbone.View.extend({
    _markup :
        "<li><span class='select-option' data-location='digest'>Digest</span></li>\
        <li><span class='select-option' data-location='feed'>Feed</span></li>\
        <li><span class='select-option' data-location='all'>All</span></li>",
    events : {
        "click .select-option" : "selectOption"
    },
    initialize : function(){
        this.render();
    },
    render : function(){
        this.el.innerHTML = this._markup;
        //this.renderTo();
    },
    selectOption : function(e){
        App.router.navigate($(e.target).data("location"), {trigger: true, replace: false});
    }
});