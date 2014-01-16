App.Views.Page_User = App.Views.BASE.extend({
    className : "page-user",
    _markup : "\
        <div class='page-header'>\
            <div class='history-back'></div>\
            <div class='h1'></div>\
            <ul class='page-menu'>\
                <li class='user-posts'>posts<i></i></li>\
                <li class='user-followers'>followers<i></i></li>\
                <li class='user-following'>following<i></i></li>\
            </ul>\
        </div>\
        <div class='page-body'></div>",
    events : {
        "click .history-back" : function(){
            Backbone.history.history.back();
        },
        "click .edit" : function(){
            App.router.navigate("edit", {trigger: true, replace: false});
        },
        "click .user-followers" : function(){
            App.router.navigate("user" + this.model.id + "/followers", {trigger: true, replace: false}); // Такие вещи можно перенести в модель как "перейти туда-то"
        },
        "click .user-following" : function(){
            App.router.navigate("user" + this.model.id + "/following", {trigger: true, replace: false}); // Такие вещи можно перенести в модель как "перейти туда-то"
        },
        "click .user-posts" : function(){
            App.router.navigate("user" + this.model.id, {trigger: true, replace: false});
        }
    },
    init : function(){
        this.render();
        this.renderHeader();
        this.renderBody();

        this.listenTo(this.model, "change", this.renderHeader);
        this.listenTo(this.model.posts, "add remove reset", this.renderHeader);
    },
    render : function(){
        this.$el.html(this._markup).appendTo(this.options.renderTo);
        if (this.model.get("id") == App.currentUser.get("id")){
            $("<span class='h1-link edit'>edit</span><a href='/signout' data-method='delete' class='h1-link' rel='nofollow'>sign out</a>").insertAfter(this.$(".h1"));
        }
    },
    renderHeader : function(){
        this.$(".h1").html(this.model.get("email"));
        this.renderMenu();
    },
    renderMenu : function(){
        this.$(".user-posts > i").html(this.model.posts.length);
        this.$(".user-followers > i").html(this.model.get("followers_count"));
        this.$(".user-following > i").html(this.model.get("following_count"));
    },
    renderBody : function(){
        if (!this.options.page || this.options.page == "posts") this.renderPostList();
        if (this.options.page == "followers" || this.options.page == "following") this.renderFollows();
    },
    renderPostList : function(){
        new App.Views.PostList({
            collection : this.collection,
            renderTo   : this.$(".page-body"),
            parent     : this
        });
    },
    renderFollows : function(){
        new App.Views.UserList({
            collection : this.collection,
            renderTo   : this.$(".page-body"),
            parent     : this
        });
    }
});







App.Views.User_Form = App.Views.BASE.extend({
    className : "page-user",
    _markup : "\
        <div class='page-header'>\
            <div class='history-back'></div>\
            <div class='h1'>Edit profile</div>\
        </div>\
        <div class='page-body'>\
            <div class='change-password'>\
                <label>Old password:</label><input name='old-pass' type='password'>\
                <label>New password:</label><input name='new-pass' type='password'>\
                <label>Confirm password:</label><input name='confirm-pass' type='password'>\
                <input type='button' class='submit-pass' value='Save password'>\
            </div>\
        </div>",
    events : {
        "click .history-back" : function(){
            Backbone.history.history.back();
        },
        "click .submit-pass" : "submitPass"
    },
    init : function(){
        this.render();
        this.renderHeader();
        this.renderBody();

        this.listenTo(this.model, "change", this.renderHeader);
        this.listenTo(this.model.posts, "add", this.addPost);
    },
    render : function(){
        this.$el.html(this._markup).appendTo(this.options.renderTo);
    },
    submitPass : function(){
        var data = {
            old  : this.$("[name=old-pass]").val(),
            user : {
                password              : this.$("[name=new-pass]").val(),
                password_confirmation : this.$("[name=confirm-pass]").val()
            }
        };

        return App.loader.sync("users/" + this.model.get("id"), {data: data , type: "PUT"})
            .done(function(result){
                this.$(".change-password input[type=password]").val("");
                return $.Deferred().resolve();
            })
            .fail(function(result){
                alert(result);
            });
    },
    renderHeader : function(){
    },
    renderBody : function(){
    }
});