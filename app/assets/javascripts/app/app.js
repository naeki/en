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
    confirm_pass   : "Confirm",
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
    photo_change   : "Изменить фото",
    flickr_open    : "Open gallery",
    photo_delete   : "Удалить",
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
App.SVG = {
    logo     : '<svg class="icon-logo" viewBox="0 0 10 4"><path d="M9.315,2.933C9.208,2.95,9.084,2.98,8.989,3.113C8.869,3.29,8.916,3.528,8.997,3.645    c0.057,0.138,0.173,0.186,0.266,0.212c0.166,0.008,0.278-0.026,0.314-0.073C9.758,3.575,9.669,3.004,9.315,2.933z M6.121,0.754    c0.042-0.049,0.049-0.149-0.13-0.323C5.67,0.073,4.276,0.379,3.395,0.504C3.352,0.257,3.222,0.169,3.125,0.12    C2.923,0.196,2.373,0.016,1.477,0c-0.263,0.009-0.52-0.005-0.734,0.109C0.562,0.19,0.46,0.266,0.435,0.351    C0.383,0.585,0.524,0.932,0.704,0.93c0.077,0.004,0.069,0.053,0.057,0.097C0.735,1.26,0.416,2.461,0.33,3.495    C0.24,3.599-0.104,3.647,0.031,4.064c0.023,0.079,0.002,0.038,0.647,0c1.042-0.062,1.654-0.241,1.965-0.403    c0.255-0.152,0.421-0.207,0.441-0.364c0.007-0.081,0.038-0.12-0.027-0.2C2.662,2.731,1.491,3.146,1.099,3.252    c-0.012-0.02-0.014,0-0.008-0.056c0.013-0.124,0.05-0.395,0.113-0.658C1.375,2.4,2.08,2.235,2.589,2.141    C2.726,2.123,2.821,2.112,2.87,2.03C2.9,1.978,2.912,1.934,2.91,1.901c-0.001-0.083,0.01-0.087-0.016-0.17    C2.747,1.48,1.635,1.574,1.262,1.679C1.246,1.565,1.27,1.505,1.279,1.368c0.033-0.266,0.029-0.398,0-0.524    c0.044-0.015,0.659,0.029,0.984,0.024c0.28-0.005,0.739,0.085,0.881-0.024c0.01,0.177,0.08,0.411,0.234,0.476    c0.165,0.054,0.339-0.027,0.458-0.007c0.06,0.437-0.043,0.311-0.294,1.618C3.451,3.41,3.39,3.818,3.667,3.985    C3.852,4.09,4.094,4.099,4.158,3.961c0.045-0.096,0.049-0.158,0.1-0.414c0.152-0.766,0.33-2.246,0.228-2.319    c0.043-0.041,0.271-0.085,0.47-0.119C5.75,0.976,5.922,0.862,6.121,0.754z M8.241,2.662c-0.13,0.02-0.771,0.4-1.672,0.478    C6.425,3.152,6.231,3.151,6.076,3.075c-0.173-0.126-0.205-0.26-0.202-0.387C5.853,2.485,5.968,2.266,6.051,2.139    c0.096-0.22,0.595-0.544,0.732-0.569C6.901,1.651,7.289,1.734,7.46,1.485C7.526,1.38,7.594,1.288,7.554,1.088    C7.508,0.889,7.379,0.601,6.711,0.639C6.329,0.69,6.096,0.887,5.837,1.085c-0.671,0.515-1.203,1.71-0.381,2.354    c0.477,0.373,1.39,0.505,2.041,0.38c0.15-0.028,0.264-0.091,0.311-0.123c0.131-0.09,0.295-0.222,0.415-0.367    c0.032-0.04,0.073-0.085,0.121-0.162c0.062-0.097,0.17-0.292,0.161-0.482C8.476,2.613,8.349,2.633,8.241,2.662z"/></svg>',
    settings : '<svg class="icon-settings" viewBox="0 0 40 40"><path d="M39.717,16.662l-3.51-1.286c-0.383-1.368-0.936-2.665-1.635-3.867l1.55-3.341     c-1.265-1.72-2.798-3.227-4.536-4.466l-3.374,1.564c-1.165-0.646-2.413-1.157-3.728-1.514l-1.281-3.494     C22.16,0.091,21.091,0,20,0s-2.16,0.091-3.204,0.259l-1.304,3.557c-1.266,0.362-2.471,0.868-3.595,1.502L8.414,3.702     C6.675,4.941,5.142,6.448,3.878,8.168L5.516,11.7c-0.634,1.124-1.14,2.328-1.502,3.595l-3.731,1.367C0.1,17.748,0,18.862,0,20     c0,0.991,0.075,1.965,0.214,2.917l3.737,1.369c0.356,1.314,0.867,2.563,1.514,3.728l-1.698,3.662     c1.205,1.672,2.657,3.152,4.31,4.382l3.63-1.683c1.202,0.698,2.499,1.251,3.867,1.635l1.378,3.76C17.945,39.921,18.963,40,20,40     s2.055-0.079,3.049-0.23l1.354-3.697c1.416-0.376,2.757-0.935,3.999-1.646l3.521,1.632c1.653-1.229,3.105-2.71,4.31-4.382     l-1.609-3.472c0.713-1.242,1.271-2.583,1.646-3.999l3.517-1.288C39.926,21.965,40,20.991,40,20     C40,18.862,39.9,17.748,39.717,16.662z M20.1,24.753c-2.68,0-4.852-2.173-4.852-4.852c0-2.68,2.172-4.852,4.852-4.852     c2.679,0,4.852,2.172,4.852,4.852C24.951,22.58,22.778,24.753,20.1,24.753z"/></svg>',
    trash    : '<svg class="icon-trash" viewBox="0 0 6 7"><path d="M5.76,1.028C5.76,0.46,4.471,0,2.88,0C1.29,0,0,0.46,0,1.028c0,0.026,0.004,0.052,0.009,0.078    l0.613,5.267l0.019,0.001C0.66,6.812,1.664,7.2,2.899,7.2c1.248,0,2.259-0.396,2.259-0.839c0-0.007-0.001-0.015-0.002-0.022    l0.02-0.004L5.76,1.067H5.758C5.759,1.054,5.76,1.042,5.76,1.028z M0.853,6.016L0.852,6.008C0.853,6.01,0.854,6.013,0.855,6.015    C0.854,6.015,0.854,6.016,0.853,6.016z M5.081,4.251c-0.07-0.096-0.187-0.186-0.339-0.267l-0.222-0.61l-0.76,0.284L3.284,3.056    L2.579,3.628c0,0,0,0-0.001,0L2.305,3.284l-0.43,0.35L1.254,3.437L1.091,3.964C0.91,4.055,0.776,4.157,0.704,4.267l-0.16-1.878    C1.023,2.67,1.868,2.857,2.88,2.857c1.02,0,1.87-0.189,2.348-0.476C5.195,2.792,5.138,3.523,5.081,4.251z M2.88,2.057    c-1.81,0-2.579-0.55-2.579-0.571S0.844,0.807,2.88,0.8c2.045-0.006,2.579,0.665,2.579,0.686S4.766,2.057,2.88,2.057z"/></svg>'
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
