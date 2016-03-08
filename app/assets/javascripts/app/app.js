window.App = {
    name        : "en_js",
    version     : "0.0",
    Views       : {},
    Models      : {},
    Collections : {},
    Lang        : {},
    SVG         : {}
};



App.Lang.En = {
    all            : "Все записи",
    sort_pop       : "popular ↑↓",
    sort_new       : "last added ↑↓",
    search         : "Поиск",
    find           : "Find",
    searchPosts    : "Search: viewed all posts",
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
    flickr_open    : "Open gallery",
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




//SVG Icons
App.SVG.settings = '<svg class="icon-settings" viewBox="0 0 40 40"><path d="M39.717,16.662l-3.51-1.286c-0.383-1.368-0.936-2.665-1.635-3.867l1.55-3.341     c-1.265-1.72-2.798-3.227-4.536-4.466l-3.374,1.564c-1.165-0.646-2.413-1.157-3.728-1.514l-1.281-3.494     C22.16,0.091,21.091,0,20,0s-2.16,0.091-3.204,0.259l-1.304,3.557c-1.266,0.362-2.471,0.868-3.595,1.502L8.414,3.702     C6.675,4.941,5.142,6.448,3.878,8.168L5.516,11.7c-0.634,1.124-1.14,2.328-1.502,3.595l-3.731,1.367C0.1,17.748,0,18.862,0,20     c0,0.991,0.075,1.965,0.214,2.917l3.737,1.369c0.356,1.314,0.867,2.563,1.514,3.728l-1.698,3.662     c1.205,1.672,2.657,3.152,4.31,4.382l3.63-1.683c1.202,0.698,2.499,1.251,3.867,1.635l1.378,3.76C17.945,39.921,18.963,40,20,40     s2.055-0.079,3.049-0.23l1.354-3.697c1.416-0.376,2.757-0.935,3.999-1.646l3.521,1.632c1.653-1.229,3.105-2.71,4.31-4.382     l-1.609-3.472c0.713-1.242,1.271-2.583,1.646-3.999l3.517-1.288C39.926,21.965,40,20.991,40,20     C40,18.862,39.9,17.748,39.717,16.662z M20.1,24.753c-2.68,0-4.852-2.173-4.852-4.852c0-2.68,2.172-4.852,4.852-4.852     c2.679,0,4.852,2.172,4.852,4.852C24.951,22.58,22.778,24.753,20.1,24.753z"/></svg>'








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
        "search"          : "_search",
        "all/popular"     : "_popular",
        "digest"          : "_digest",
        "feed"            : "_feed",
        "bookmarks"       : "_bookmarks",
        'users'           : "_users",
        "user:id(/)"      : "_user",
        "user:id(/:page)" : "_user",
        "tag:id(/)"       : "_search",
        "edit"            : "_edit",
        ":id"             : "_post",
        "new"             : "_post"
    },
    _post      : function(){this._use({post : arguments[0], page : arguments[1]})},
    _user      : function(){this._use({user : arguments[0], page: arguments[1]})},

    _edit      : function(){App.main.editProfile()},

    _all       : function(){
        this._use({
            folder : App.Views.All,
            type   : "new"})
    },
    _search    : function(){
        this._use({
            folder : App.Views.Search,
            tag    : arguments[0],
            type   : "new"
        })
    },

    _popular   : function(){
        this._use({
            folder : App.Views.All,
            type   : "pop"
        })
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



    //todo: Зачем этот метод? только чтобы запускать другой?




    sync : function(url, params, options){
        var options = options || {}; dfd = $.Deferred();
        App.loader.send(dfd, url, params, options)
        .then(
            function(dfd, result){
                if (!result || result.error){
                    if (result && result.error && (result.error == 2))
                        return App.service.signout();
                    else
                        return dfd.reject(this.errors[result && result.error] || (result && result.error) || result);
                }
                else
                    return dfd.resolve(result);
            }.bind(this, dfd),

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
