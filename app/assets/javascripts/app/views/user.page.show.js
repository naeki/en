App.Views.Page_User = App.Views.BASE.extend({
    className : "page-user",
    _markup : "\
        <div class='user-controls'></div>\
        <div class='page-header'>\
            <div class='history-back'></div>\
            <img class='user-photo'>\
            <div class='h1'></div>\
            <ul class='page-menu'>\
                <li class='user-posts'>"+ Lang.posts +"<i></i></li>\
                <li class='user-likes'>"+ Lang.likes +"<i></i></li>\
                <li class='user-followers'>"+ Lang.followers +"<i></i></li>\
                <li class='user-following'>"+ Lang.following +"<i></i></li>\
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
        "click .user-following:not(.locked)" : function(){
            App.router.navigate("user" + this.model.id + "/following", {trigger: true, replace: false}); // Такие вещи можно перенести в модель как "перейти туда-то"
        },
        "click .user-posts" : function(){
            App.router.navigate("user" + this.model.id, {trigger: true, replace: false});
        },
        "click .user-likes" : function(){
            App.router.navigate("user" + this.model.id + "/likes", {trigger: true, replace: false});
        },
        "click .user-follow.follow" : function(){
            App.currentUser.follow(this.model);
        },
        "click .user-follow.unfollow" : function(){
            App.currentUser.unfollow(this.model);
        },
        "click .icon-trash" : function(){
            var url = _.last(Backbone.history.getFragment().split("/")) == "deleted" ? "" : "/deleted";
            App.router.navigate("user" + this.model.id + url, {trigger: true, replace: false});
        }
    },
    init : function(){
        this.render();

        this.$title    = this.$(".h1");
        this.$photo    = this.$(".user-photo");
        this.$controls = this.$(".user-controls");

        this.renderHeader();
        this.renderBody();

        this.listenTo(App.currentUser, "change:following", this.renderHeader);
        this.listenTo(this.model, "change", this.renderHeader);
        this.listenTo(this.model.posts, "add remove reset", this.renderHeader);
    },
    render : function(){
        this.$el.html(this._markup).appendTo(this.options.renderTo);
    },
    renderHeader : function(){
        this.$title.html(this.model.get("name"));

        this.$photo.attr({
            src : this.model.getNormalPhoto(),
            alt : this.model.get("name")
        });

        if (this.model.get("id") == App.currentUser.get("id"))
            this.$controls.html($("<span class='h1-link edit'></span>").html(App.SVG.settings));
        else {
            var following = ~App.currentUser.get("following").indexOf(this.model.id);

            this.$controls.html($("<button class='user-follow'></button>")
                .html(following ? Lang.unfollow : Lang.follow)
                .addClass(following ? "unfollow" : "follow"));

            if (~App.currentUser.get("followers").indexOf(this.model.id))
                this.$controls.append("<span class='note'>"+ Lang.following_you +"</span>")
        }

        this.renderMenu();
    },
    renderMenu : function(){
        this.$(".user-posts > i").html(this.model.posts.length);
        this.$(".user-likes > i").html(this.model.get("likes_count"));
        this.$(".user-followers > i").html(this.model.get("followers_count"));
        this.$(".user-following > i").html(this.model.get("following_count"));

        if (~this.model.get("permissions")&User.ME)
            this.$(".user-following").addClass("locked");
    },
    renderBody : function(){       // Очень сложно тут
        this.$(".trash-link").remove();

        if (this.model.get("permissions")&User.ME && !this.options.page || this.options.page == "posts" || this.options.page == "deleted")
            this.$(".page-body").append(App.SVG.trash);
        if (this.options.page == "deleted")
            this.$(".trash-link").prepend("← ");

        if (!this.options.page || this.options.page == "posts" || this.options.page == "deleted" || this.options.page == "likes")
            this.renderPostList();         // TODO: Решать что выводить в модели в оупене
        if (this.options.page == "followers" || this.options.page == "following")
            this.renderFollows();
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
            <div class='h1'>"+ Lang.edit_profile +"</div>\
        </div>\
        <div class='page-body'>\
            <div class='change-photo'>\
                <h3>"+ Lang.photo_change +"</h3>\
                <img class='user-photo static'>\
                <div class='upload-bar'></div>\
                <input type='file' class='select-file' value='"+ Lang.upload +"'>\
                <input type='button' class='submit-photo' value='"+ Lang.save_photo +"'>\
                <input type='button' class='delete-photo' value='"+ Lang.photo_delete +"'>\
            </div>\
            <div class='change-name'>\
                <h3>"+ Lang.change_name +"</h3>\
                <input type='text' class='edit-name'>\
                <input type='button' class='submit-name' value='"+ Lang.save_name +"'>\
            </div>\
            <div class='change-password'>\
                <h3>"+ Lang.change_pass +"</h3>\
                <label>"+ Lang.old_pass +":</label><input name='old-pass' type='password'>\
                <label>"+ Lang.new_pass +":</label><input name='new-pass' type='password'>\
                <label>"+ Lang.confirm_pass +":</label><input name='confirm-pass' type='password'>\
                <input type='button' class='submit-pass' value='"+ Lang.save_pass +"'>\
            </div>\
        </div>",
    events : {
        "click .history-back" : function(){
            Backbone.history.history.back();
        },
        "click .submit-pass"  : "submitPass",
        "click .submit-photo" : "submitPhoto",
        "click .delete-photo" : "deletePhoto",
        "click .submit-name"  : "submitName"
    },
    init : function(){
        this.render();
        this.renderHeader();
        this.renderBody();

        this.listenTo(this.model, "change", this.renderHeader);
        this.listenTo(this.model, "change:photo_id", this.renderBody);
        this.listenTo(this.model.posts, "add", this.addPost);
    },
    render : function(){
        this.$el.html(this._markup).appendTo(this.options.renderTo);

        this.$(".edit-name").val(this.model.get("name"));
    },
    submitPass : function(){                                                // TODO: Какого черта это тут делает? перенести в модель
        var data = {
            id   : this.model.id,
            old  : this.$("[name=old-pass]").val(),
            user : {
                password              : this.$("[name=new-pass]").val(),
                password_confirmation : this.$("[name=confirm-pass]").val()
            }
        };

        return App.loader.sync("users", {data: data , type: "PUT"})
            .done(function(){
                this.$(".change-password input[type=password]").val("");
                return $.Deferred().resolve();
            }.bind(this));
    },
    submitPhoto : function(){                                               // TODO: Какого черта это тут делает? перенести в модель
        var data = {file : this.$(".select-file")[0].files[0]};

        this.$(".upload-bar").addClass("visible");
        return App.loader.sync("users/photo", {data: data , type: "POST"}).then(
            function(result){
                setTimeout(function(){
                    User.builder(result).trigger("change:photo_id");
                    this.$(".upload-bar").removeClass("visible").css("background-size","0% 100%");
                }.bind(this), 200);
            }.bind(this),
            function(){},
            function(progress){
                this.$(".upload-bar").css("background-size", progress*100 + "% 100%");
            }.bind(this)
        );
    },
    deletePhoto : function(){                                               // TODO: Какого черта это тут делает? перенести в модель
        return App.loader.sync("users/photo", {type: "DELETE"});
    },
    submitName : function(){                                                // TODO: Какого черта это тут делает? перенести в модель как сейв
        return App.loader.sync("users", {
            data: {
                id : this.model.id,
                user : {
                    name : this.$(".edit-name").val()
                }
            },
            type: "PUT"}).done(function(model){User.builder(model)});
    },
    renderHeader : function(){
    },
    renderBody : function(){
        this.$(".user-photo").attr({
            src : this.model.getNormalPhoto(),
//            src : this.model.get("avatar_url"),
            alt : this.model.get("email")
        });
    }
});