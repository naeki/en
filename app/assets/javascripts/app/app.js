window.App = {
    name        : "en_js",
    version     : "0.0",
    Views       : {},
    Models      : {},
    Collections : {},
    Lang        : {}
};


App.Lang.En = {
    all            : "Все записи",
    bookmarks      : "Закладки",
    digest         : "Дайджест",
    feed           : "Лента",
    users          : "Пользователи",
    edit           : "Edit",
    send           : "Send",
    add            : "+",
    upload         : "Upload",
    save           : "Save",
    delete         : "Delete",
    return         : "Return",
    new_post       : "New post",
    likes          : "Recommendations",
    heart          : "♥",
    edit_profile   : "Edit profile",
    change_name    : "Change name",
    save_name      : "Save name",
    change_pass    : "Change password",
    old_pass       : "Old password",
    new_pass       : "New password",
    confirm_pass   : "Confirm new password",
    save_pass      : "Save password",
    followers      : "Followers",
    following      : "Following",
    follow         : "Follow",
    unfollow       : "Unfollow",
    following_you  : "Following you",
    tags           : "Tags",
    tags_edit      : "Edit tags",
    posts          : "Posts",
    deleted        : "Deleted",
    post_deleted   : "Post was deleted",
    photo_change   : "Change photo",
    photo_delete   : "Delete photo",
    save_photo     : "Save photo",
    change_life    : "Change existing",
    post_isdeleted : "Post was deleted",
    change_access  : "Change access",
    private        : "Private",
    public         : "Public",
    error : {
        loading    : "Error loading ",
        password   : "Entered password is wrong"
    },
    signout        : "Sign out",
    signin         : "Sign in",
    confirm        : "Are you sure?",
    months         : ["January", "February", "Mach", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
}




window.Lang = App.Lang.En;

window.Src = {
    userPhoto : "/photo/",
    defaultUserPhoto : "u0"
}




App.Router = Backbone.Router.extend({
    initialize : function(){
        Backbone.history.start({pushState: true});
    },
    routes: {
        "all"             : "_all",
        "all/popular"     : "_popular",
        "digest"          : "_digest",
        "feed"            : "_feed",
        "bookmarks"       : "_bookmarks",
        'users'           : "_users",
        "user:id(/)"      : "_user",
        "user:id(/:page)" : "_user",
        "edit"            : "_edit",
        ":id"             : "_post",
        "new"             : "_post"
    },
    _post      : function(){this._use({post : arguments[0], page : arguments[1]})},
    _user      : function(){this._use({user : arguments[0], page: arguments[1]})},

    _edit      : function(){App.main.editProfile()},

    _all       : function(){
        this._use({folder : App.Views.All, type: "new"})
    },
    _popular   : function(){
        this._use({folder : App.Views.All, type: "pop"})
    },
    _digest    : function(){this._use({folder : App.Views.Digest})},
    _feed      : function(){this._use({folder : App.Views.Feed})},
    _bookmarks : function(){this._use({folder : App.Views.Bookmarks})},
    _users     : function(){this._use({folder : App.Views.Users})},

    _use : function(options){
        App.main.open(options);
    }
});




App.loader = {
    dfd : {
        current_user : $.Deferred()
    },
    sync : function(url, params, options){
        var options = options || {}, dfd = $.Deferred();
        App.loader.send(dfd, url, params, options)
        .then(
            function(result){
                if (!result || result.error){
                    if (result && result.error && (result.error == 2))
                        return App.service.signout();
                    else
                        return dfd.reject(this.errors[result && result.error] || (result && result.error) || result);
                }
                else
                    return dfd.resolve(result);
            }.bind(this),

            function(result){
                alert(Lang.error.loading + result.toString());
            }.bind(this)
        )
        return dfd;
    },
    send : function(result, url, params, options){
        var params = params || {},
            data   = params.data || {};

        var startAjaxSettings = {
            url  : url,
            type : params.type || "GET",
            data : data
        };

        /** MULTIPART */
        if(App.service.checkForFile(data)){
            $.extend(startAjaxSettings, {
                data : App.makeFormData(data),
                contentType: false,
                processData: false,
                cache: false,
                xhr : function(){
                    var xhr = $.ajaxSettings.xhr();
                    $(xhr.upload).bind('progress', function(e){
                        var originalEvent = e.originalEvent;
                        if(!originalEvent.lengthComputable) return;
                        result.notify(originalEvent.loaded / originalEvent.total);
                        console.log(originalEvent.loaded / originalEvent.total * 100 + '%')
                    });
                    return xhr;
                }
            });
        }
        return $.ajax(startAjaxSettings).fail(function(xhr, textStatus){
            alert(textStatus);
        })
    },
    preload : function(){
        return this.loadCurrentUser();
    },
    loadCurrentUser : function(){
        App.currentUser = User.builder();
        return this.sync("/sessions/get_current_user", {type : "GET"}).then(function(result){
            App.currentUser.digest_tags.set(result.digest_settings);
            return App.loader.dfd.current_user.resolve(App.currentUser.set(result));
        });
    },
    errors : {
        1 : Lang.error.password
    }
}


App.service = {
    signout : function(){
        window.location = "/signin";
        App.main.remove();
        return $.Deferred().reject();
    },
    checkForFile : function(data){
        if(!$.isPlainObject(data)) return false;
        return _.any(data, function(element){
            if(element instanceof File) return true;
            else return App.service.checkForFile(element);
        });
    }
//    convertFile : function(file, method){
//        method || (method = 'blob');
//        var reader = new FileReader(), dfd = $.Deferred();
//        reader.onload = function(e){
//            dfd.resolve(file[method] = reader.result);
//        };
//        reader.onerror = dfd.reject;
//        reader[method == "blob" ? "readAsBinaryString" : "readAsDataURL"](file);
//        return dfd;
//    }
};

(function(){
    var iteration = function(data, prefix){
        return $.map(data, function(element, key){
            var pre = prefix ? prefix + '[' + key + ']' : key;

            if(['string','number','boolean'].indexOf(typeof(element)) !== -1)
                return [[pre, element]];
            else if(element instanceof File)
                return [[key, element]];
            else if($.isPlainObject(element))
                return iteration(element, pre);
        });
    };
    App.makeFormData = function(data){
        var form = new FormData();
        _.each(iteration(data), function(el){
            form.append.apply(form, el);
        });
        return form;
    };
})();
